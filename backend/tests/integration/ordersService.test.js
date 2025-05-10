const request = require('supertest');
const app = require('../../app');
const {mysqlPool} = require('../../config/mysql-db');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');



describe('food items Service Integration Tests', () => {
    let validJwtTokenChef;
    let validJwtTokenCustomer;
    let testUserIdChef;
    let foodItems;
    let orderId;
    let foodId1;
    let foodId2;
    let orderData;

    beforeAll(async () => {
        
        // Set up test database 
        await mysqlPool.query(`
                CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                state VARCHAR(255) NULL,
                city VARCHAR(255) NULL,
                image_url VARCHAR(255) NULL,
                type ENUM('chef', 'customer') NOT NULL
                );`);

        await mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS chefs (
            user_id INT PRIMARY KEY,
            bio TEXT NULL, 
            specialty VARCHAR(255) NULL,
            followers_count INT DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
             ); `);

             await mysqlPool.query(`
                CREATE TABLE IF NOT EXISTS customers (
                user_id INT PRIMARY KEY,
                following_count INT DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                 );`);

             await mysqlPool.query(`CREATE TABLE if not exists food_items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            chef_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT NULL,
            price DECIMAL(10,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            image_url VARCHAR(255) NULL,
            FOREIGN KEY (chef_id) REFERENCES chefs(user_id) ON DELETE CASCADE
              );`)


              await mysqlPool.query(`CREATE TABLE if not exists orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                customer_id INT NOT NULL,
                chef_id INT NOT NULL,
                status ENUM('pending', 'confirmed', 'completed', 'canceled') DEFAULT 'pending',
                total DECIMAL(10, 2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
                FOREIGN KEY (chef_id) REFERENCES chefs(user_id) ON DELETE CASCADE
                  );`)

             await mysqlPool.query(`CREATE TABLE if not exists order_food (
                order_id INT NOT NULL,
                food_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                food_name VARCHAR(255) NOT NULL,
                food_price DECIMAL(10, 2) NOT NULL,
                PRIMARY KEY (order_id, food_id),
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
                      );`)

            });
            
    beforeEach(async()=>{

            //clear the tables before each test
            await mysqlPool.query('DELETE FROM users');

            // Hash the password before storing
           const saltRounds =10;
           const hashedPassword= await bcrypt.hash("password123",saltRounds);

           // create chef user and customer user to be used in test
            const [chefResult] =await mysqlPool.query('INSERT INTO users (name, email, password,state, city,image_url,type ) VALUES (?, ?, ?,?,?,?,?)', ['chefUser', 'chefTest@example.com', hashedPassword,'washington','renton',null,'chef']);
            testUserIdChef= chefResult.insertId;
            validJwtTokenChef = jwt.sign({ id: testUserIdChef }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            await mysqlPool.query('INSERT INTO chefs (user_id, bio) VALUES (?, ?)', [chefResult.insertId, null]);

             const [customerResult] =await mysqlPool.query('INSERT INTO users (name, email, password,state, city,image_url,type ) VALUES (?, ?, ?,?,?,?,?)', ['customerUser', 'customerTest@example.com', hashedPassword,'washington','renton',null,'customer']);
             testUserIdCustomer= customerResult.insertId;
             validJwtTokenCustomer = jwt.sign({ id: testUserIdCustomer }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
             await mysqlPool.query('INSERT INTO customers (user_id) VALUES (?)', [customerResult.insertId]);

            
             // create food itmes to be used in test
             const [result1] = await mysqlPool.query("INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)",[testUserIdChef,"pizza",null,10,'main',null]);
               foodId1 = result1.insertId;   
               const [result2] = await mysqlPool.query("INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)",[testUserIdChef,"shawerma",null,15,'side',null]);
               foodId2 = result2.insertId;     
               console.log(foodId1,foodId2);
               
             // create orders to be used in tests
             const [orderResult] = await mysqlPool.query(
                "INSERT INTO orders (customer_id, chef_id, total) VALUES (?, ?, ?)",[testUserIdCustomer, testUserIdChef, 25]);
                 orderId = orderResult.insertId;
                // Step 2: Insert into `order_food` table (bulk insert)
                foodItems=[{food_id:foodId1,quantity:1,food_name:'pizza',food_price:10},{food_id:foodId2,quantity:1,food_name:'shawerma',food_price:15}];
                const orderItems = foodItems.map(({ food_id, quantity,food_name,food_price }) => [orderId, food_id, quantity,food_name,food_price]);
                 await mysqlPool.query("INSERT INTO order_food (order_id, food_id, quantity,food_name,food_price) VALUES ?",[orderItems]);    
                
                 orderData = {total:25,chefId:testUserIdChef,items:[{food_id:foodId1,quantity:1,food_name:'pizza',food_price:10},{food_id:foodId2,quantity:1,food_name:'shawerma',food_price:15}]};
                // console.log(orderId);


        });  
        
    afterAll(async () => {
            // Clean up test data 
            await mysqlPool.query('DELETE FROM users');
            await mysqlPool.end(); 
         
        });


    describe('submit order', () => {
       // const orderData = {total:25,chefId:testUserIdChef,items:[{food_id:foodId1,quantity:1},{food_id:foodId2,quantity:1}]};
        
        test('should submit order successfully', async () => {
             
            // Make a request to your API to submit order using the valid JWT token
             const response = await request(app)
             .post(`/api/orders/add`)
             .set('Authorization', `Bearer ${validJwtTokenCustomer}`)  
             .send(orderData);
              // Verify the response
              expect(response.status).toBe(200);
              expect(response.body.message).toBe('Order submitted successfully');
            });

            test('should not submit order successfully because invalid order data', async () => {
                const orderData = {total:null,chefId:testUserIdChef,items:[{food_id:foodId1,quantity:1},{food_id:foodId2,quantity:1}]}
                // Make a request to your API to submit order using the valid JWT token
                 const response = await request(app)
                 .post(`/api/orders/add`)
                 .set('Authorization', `Bearer ${validJwtTokenCustomer}`)  
                 .send(orderData);
                  // Verify the response
                  expect(response.status).toBe(500);
                  expect(response.body.message).toBe('Missing required fields');
                });

                     
        });  


    describe('decline Or Accept Order', () => {
            
            test('should accept order successfully', async () => {
             
            // Make a request to your API to accept order using the valid JWT token
             const response = await request(app)
             .put(`/api/orders/put/${orderId}`)
             .set('Authorization', `Bearer ${validJwtTokenChef}`)  
             .send({ status: 'confirmed' });
              // Verify the response
              expect(response.status).toBe(200);
              expect(response.body.message).toBe('Order status changed successfully');
        
              
              const [rows] = await mysqlPool.query('SELECT status FROM orders WHERE id = ?', [orderId]);
              expect(rows[0].status).toBe("confirmed"); 
            });


            test('should decline order successfully', async () => {
                
                // Make a request to your API to accept order using the valid JWT token
                 const response = await request(app)
                 .put(`/api/orders/put/${orderId}`)
                 .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                 .send({ status: 'canceled' });

            
                  // Verify the response
                  expect(response.status).toBe(200);
                  expect(response.body.message).toBe('Order status changed successfully');
            
                  
                  const [rows] = await mysqlPool.query('SELECT status FROM orders WHERE id = ?', [orderId]);
                  expect(rows[0].status).toBe("canceled"); 
                });

                test('should not accept order successfully because invalid status', async () => {
                
                
                    // Make a request to your API to accept order using the valid JWT token
                     const response = await request(app)
                     .put(`/api/orders/put/0`)
                     .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                     .send({ status: null });
                
                      // Verify the response
                      expect(response.status).toBe(404);
                      expect(response.body.message).toBe('status invalid');
                    });    

         
                    test('should not accept order successfully because order id invalid', async () => {
                
                        // Make a request to your API to accept order using the valid JWT token
                         const response = await request(app)
                         .put(`/api/orders/put/0`)
                         .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                         .send({ status: 'confirmed' });
                    
                          // Verify the response
                          expect(response.status).toBe(500);
                          expect(response.body.message).toBe('order not found');
                        });            
        });  

    describe('get orders for chef', () => {
            // queries to create an order so i can test 
            

            test('should get chef orders successfully', async () => {
               
            // Make a request to your API to accept order using the valid JWT token
             const response = await request(app)
             .get('/api/orders/get/chef')
             .set('Authorization', `Bearer ${validJwtTokenChef}`);  
             
        
              // Verify the response
              expect(response.status).toBe(200);
              
        
            });        
        });  

    describe('get orders for customer', () => {
          
            test('should get customer orders successfully', async () => {
               
            // Make a request to your API to accept order using the valid JWT token
             const response = await request(app)
             .get('/api/orders/get/customer')
             .set('Authorization', `Bearer ${validJwtTokenChef}`)  
             
              // Verify the response
              expect(response.status).toBe(200);
              //expect(response.body.message).toBe('Order status changed successfully');
        
            });        
        });  

        describe('get order', () => {
          
            test('should get order successfully', async () => {

                console.log("orderId",orderId);
            // Make a request to your API to get order using the valid JWT token
             const response = await request(app)
             .get(`/api/orders/get/${orderId}`)
             .set('Authorization', `Bearer ${validJwtTokenChef}`);  
             
              // Verify the response
              expect(response.status).toBe(200);
        
            });   
       
            
            test('should not get order successfully because of invalid order id', async () => {
               
                // Make a request to your API to get order using the valid JWT token
                 const response = await request(app)
                 .get(`/api/orders/get/0`)
                 .set('Authorization', `Bearer ${validJwtTokenChef}`);  
                 
                 
                  // Verify the response
                  expect(response.status).toBe(500);
                  expect(response.body.message).toBe('error in getting order by id model');

                });                 
        });  


});