const request = require('supertest');
const app = require('../../app');
const {mysqlPool} = require('../../config/mysql-db');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');

describe('food items Service Integration Tests', () => {
    let validJwtTokenChef;
    

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

            });

    beforeEach(async()=>{
            await mysqlPool.query('DELETE FROM users');
            // Hash the password before storing
           const saltRounds =10;
           const hashedPassword= await bcrypt.hash("password123",saltRounds);
    
            const [chefResult] =await mysqlPool.query('INSERT INTO users (name, email, password,state, city,image_url,type ) VALUES (?, ?, ?,?,?,?,?)', ['chefUser', 'chefTest@example.com', hashedPassword,'washington','renton',null,'chef']);
            testUserIdChef= chefResult.insertId;
            validJwtTokenChef = jwt.sign({ id: testUserIdChef }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
            await mysqlPool.query('INSERT INTO chefs (user_id, bio) VALUES (?, ?)', [chefResult.insertId, null]);

        });  
        
        afterAll(async () => {
            // Clean up test data 
            await mysqlPool.query('DELETE FROM users');
            await mysqlPool.end(); 
         
        });


        describe('add food item', () => {

            test('should add food item successfully', async () => {
                const foodData= {name:"pizza", description:"cheese pizza",price:10,image_url:'',category:'main'};
                
                  // Make a request to your API to update the username, using the valid JWT token
                  const response = await request(app)
                  .post('/api/foodItems/add')
                  .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                  .send(foodData);
        
              // Verify the response
              expect(response.status).toBe(200);
              expect(response.body.message).toBe('food added successfully');
        
              
              const [rows] = await mysqlPool.query('SELECT name FROM food_items WHERE chef_id = ?', [testUserIdChef]);
              expect(rows[0].name).toBe(foodData.name); 
            });

            test('should not add food item successfully because of incorrect food data', async () => {
                const foodData= {name:"", description:"cheese pizza",price:"",image_url:'',category:'main'};
                
                // Make a request to your API to update the username, using the valid JWT token
                const response = await request(app)
                .post('/api/foodItems/add')
                .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                .send(foodData);
      
            // Verify the response
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Missing required fields');
      
            
            
          });

        });



        describe('update food item', () => {
            
            test('should update food item successfully', async () => {
                const [result] = await mysqlPool.query("INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)",[testUserIdChef,"pizza",null,10,'main',null]);
                const foodId = result.insertId; 
                const foodData= {name:"shawerma", description:"cheese pizza",price:10,image_url:''};
                
                  // Make a request to your API to update the username, using the valid JWT token
                  const response = await request(app)
                  .put(`/api/foodItems/put/${foodId}`)
                  .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                  .send(foodData);
        
              // Verify the response
              expect(response.status).toBe(200);
              expect(response.body.message).toBe('food updated successfully');
        
              
              const [rows] = await mysqlPool.query('SELECT name FROM food_items WHERE chef_id = ?', [testUserIdChef]);
              expect(rows[0].name).toBe(foodData.name); 
            });

            test('should not update food item successfully because of incorrect food data', async () => {
                const [result] = await mysqlPool.query("INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)",[testUserIdChef,"pizza",null,10,'main',null]);
                const foodId = result.insertId; 
                const foodData= {description:"cheese pizza",price:10,image_url:''};
                
                // Make a request to your API to update the username, using the valid JWT token
                const response = await request(app)
                .put(`/api/foodItems/put/${foodId}`)
                .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                .send(foodData);
      
            // Verify the response
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Missing required fields');
      
            
            
          });

             test('should not update food item successfully because of wrong food id', async () => {
        const [result] = await mysqlPool.query("INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)",[testUserIdChef,"pizza",null,10,'main',null]);
        const foodId = result.insertId; 
        const foodData= {name:"shawerma", description:"cheese pizza",price:10,image_url:''};
        
        // Make a request to your API to update the username, using the valid JWT token
        const response = await request(app)
        .put(`/api/foodItems/put/0`)
        .set('Authorization', `Bearer ${validJwtTokenChef}`)  
        .send(foodData);

    // Verify the response
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('food id doesnot exist');

    
    
            });

        });


        describe('delete food item', () => {
            
            test('should delete food item successfully', async () => {
                const [result] = await mysqlPool.query("INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)",[testUserIdChef,"pizza",null,10,'main',null]);
                const foodId = result.insertId; 
                
                  // Make a request to your API to update the username, using the valid JWT token
                  const response = await request(app)
                  .delete(`/api/foodItems/delete/${foodId}`)
                  .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                  
        
              // Verify the response
              expect(response.status).toBe(200);
              expect(response.body.message).toBe('food deleted successfully');
        
              
              const [rows] = await mysqlPool.query('SELECT name FROM food_items WHERE id = ?', [foodId]);
              expect(rows.length ).toBe(0); 
            });

            test('should not delete food item successfully because food id does not exist', async () => {
                const [result] = await mysqlPool.query("INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)",[testUserIdChef,"pizza",null,10,'main',null]);
                const foodId = result.insertId;                 
                // Make a request to your API to update the username, using the valid JWT token
                const response = await request(app)
                .delete(`/api/foodItems/delete/${0}`)
                .set('Authorization', `Bearer ${validJwtTokenChef}`)  
            
      
            // Verify the response
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('food id doesnot exist');
      
            
            
          });

             

        });

        describe('get food items from a chef', () => {

            test('should get all food items successfully', async () => {
                await mysqlPool.query("INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)",[testUserIdChef,"pizza",null,10,'main',null]);
            
                  // Make a request to your API to get all food items, using the valid JWT token
                  const response = await request(app)
                  .get('/api/foodItems/get')
                  .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                  
        
              // Verify the response
              console.log(response.body);

              expect(response.status).toBe(200);
            
             // expect(response.body.result).toBe([{testUserIdChef,"pizza",null,}]); 

            });

            

        });

});