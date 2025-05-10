const request = require('supertest');
const app = require('../../app');
const {mysqlPool} = require('../../config/mysql-db');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');




describe('User Service Integration Tests', () => {
    let validJwtTokenChef; // We'll store the valid token here for a chef user
    let validJwtTokenCustomer;  // We'll store the valid token here for a customer user
    let testUserIdChef;
    let testUserIdCustomer;

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

        await mysqlPool.query(`
            CREATE TABLE IF NOT EXISTS followers (
            customer_id INT NOT NULL,
            chef_id INT NOT NULL,
            PRIMARY KEY (customer_id, chef_id),
            FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
            FOREIGN KEY (chef_id) REFERENCES chefs(user_id) ON DELETE CASCADE
            );`);
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

        const [customerResult] =await mysqlPool.query('INSERT INTO users (name, email, password,state, city,image_url,type ) VALUES (?, ?, ?,?,?,?,?)', ['customerUser', 'customerTest@example.com', hashedPassword,'washington','renton',null,'customer']);
        testUserIdCustomer= customerResult.insertId;
        validJwtTokenCustomer = jwt.sign({ id: testUserIdCustomer }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await mysqlPool.query('INSERT INTO customers (user_id) VALUES (?)', [customerResult.insertId]);

    });

    afterAll(async () => {
        // Clean up test data 
        await mysqlPool.query('DELETE FROM users');
        await mysqlPool.end(); 
     
    });

    describe('sign up a new User',()=>{

        const newUser= {
            "name": "abood",
            "email": "abood@hotmail.com",
            "password": "abood123",
            "state": "washington",
            "city": null,
            "image_url": null,
            "type": "chef",
            "additionalData": {
              "bio": "Experienced chef with a passion for arab cuisine.",
              "specialty": null,
              "followers_count": null
            }
          };

          test('should create a new user successfully', async()=>{
            // Make a request to your API to create a new user
          const response = await request(app)
          .post('/api/users/signup')
          .send(newUser);
         

         // Verify the response
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('user created');

        // Verify that the user's name was updated in the database
        const [rows] = await mysqlPool.query('SELECT name FROM users WHERE name = ?', [response.body.name]);
        expect(rows[0].name).toBe(response.body.name); 
            });

            test('should fail to create a new user if a user already exist with this email', async()=>{
               
                await mysqlPool.query(
                    'INSERT INTO users (name, email, password, state, city, image_url, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    ['ExistingUser', newUser.email, 'somehashedpassword', 'SomeState', 'SomeCity', null, 'chef']
                  );

                  // Make a request to your API to create a new user
              const response = await request(app)
              .post('/api/users/signup')
              .send(newUser);
           
             // Verify the response
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email already exists, choose another email');
        });

        test('should fail if required fields are missing', async () => {
            const response = await request(app)
              .post('/api/users/signup')
              .send({ name: 'No Email' }); // missing email and password
            expect(response.status).toBe(500);
            expect(response.body.message).toMatch("Missing required fields");
          });


          test('should fail if email format is invalid', async () => {
            const response = await request(app)
              .post('/api/users/signup')
              .send({ 
                ...newUser, 
                email: 'invalid-email' 
              });
          
            expect(response.status).toBe(500);
            expect(response.body.message).toMatch("Invalid email format");
          });

          test('should fail if password is too short', async () => {
            const response = await request(app)
              .post('/api/users/signup')
              .send({ 
                ...newUser, 
                password: '123' 
              });
          
            expect(response.status).toBe(500);
            expect(response.body.message).toMatch("Password must be at least 6 characters long");
          });

          test('should fail if user type is invalid', async () => {
            const response = await request(app)
              .post('/api/users/signup')
              .send({ 
                ...newUser, 
                type: 'invalidType' 
              });
          
            expect(response.status).toBe(500);
            expect(response.body.message).toMatch("Invalid user type");
          });
    });

    describe('Login user',()=>{
        test('should log in successfully',async()=>{

            const response = await request(app)
          .post('/api/users/login')
          .send({email:"chefTest@example.com",password:"password123"});
         

         // Verify the response
        // console.log(response.body.message);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('login successful');
        });

        test('should not log in successfully because email not found',async()=>{

            const response = await request(app)
          .post('/api/users/login')
          .send({email:"adasda",password:"password123"});
         

         // Verify the response
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
        });

        test('should not log in successfully because password does not match',async()=>{

            const response = await request(app)
          .post('/api/users/login')
          .send({email:"chefTest@example.com",password:"password"});
         

         // Verify the response
       // console.log(response.body.message);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Password is incorrect');
        });

        test('should not log in successfully because password or email are missing',async()=>{

            const response = await request(app)
          .post('/api/users/login')
          .send({email:"",password:""});
         

         // Verify the response
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('email or password are missing');
        });

    });

    describe('Delete user',()=>{

        test('should delete user successfully',async()=>{

            const response = await request(app)
          .delete('/api/users/delete')
          .set('Authorization', `Bearer ${validJwtTokenChef}`)  
          .send({password:"password123"});
         

         // Verify the response
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('user deleted');
        });

        test('should not delete user successfully becasue of incorrect password',async()=>{

            const response = await request(app)
          .delete('/api/users/delete')
          .set('Authorization', `Bearer ${validJwtTokenChef}`)  
          .send({password:"dgdfg"});
         

         // Verify the response
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Password is incorrect');
        });


        test('should not delete user successfully becasue of missing password',async()=>{

            const response = await request(app)
          .delete('/api/users/delete')
          .set('Authorization', `Bearer ${validJwtTokenChef}`)  
          .send({password:""});
         

         // Verify the response
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('password is missing');
        });
    });

    describe('Update user name',()=>{
    test('should update user name successfully', async () => {
        const newName= "John Updated";
        
          // Make a request to your API to update the username, using the valid JWT token
          const response = await request(app)
          .put('/api/users/put/name')
          .set('Authorization', `Bearer ${validJwtTokenChef}`)  
          .send({ name: newName });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('name updated successfully');

      // Verify that the user's name was updated in the database
      const [rows] = await mysqlPool.query('SELECT name FROM users WHERE id = ?', [testUserIdChef]);
      expect(rows[0].name).toBe(newName); 
    });

    test('should fail to update user name if name is empty', async () => {
        const response = await request(app)
          .put('/api/users/put/name')
          .set('Authorization', `Bearer ${validJwtTokenChef}`)
          .send({ name: null });
    
        // Expect 400 Bad Request because name cannot be empty
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Name cannot be empty');
      });

    });

    describe('Update user image ',()=>{
        test('should update user image successfully', async () => {
            const newImage_url= "sdffsf";
            
              // Make a request to your API to update the username, using the valid JWT token
              const response = await request(app)
              .put('/api/users/put/image')
              .set('Authorization', `Bearer ${validJwtTokenChef}`)  
              .send({ image_url: newImage_url });
    
          // Verify the response
          expect(response.status).toBe(200);
          expect(response.body.message).toBe('image updated successfully');
    
          // Verify that the user's image_url was updated in the database
          const [rows] = await mysqlPool.query('SELECT image_url FROM users WHERE id = ?', [testUserIdChef]);
          expect(rows[0].image_url).toBe(newImage_url); 
        });
     });

     describe('Update user address ',()=>{
            test('should update user address successfully', async () => {
                
                  // Make a request to your API to update the username, using the valid JWT token
                  const response = await request(app)
                  .put('/api/users/put/address')
                  .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                  .send({ state:"california",city:"LA" });
        
              // Verify the response
              expect(response.status).toBe(200);
              expect(response.body.message).toBe('address updated successfully');
        
              // Verify that the user's address was updated in the database
              const [rows] = await mysqlPool.query('SELECT state, city FROM users WHERE id = ?', [testUserIdChef]);
              expect(rows[0].state).toBe("california"); 
              expect(rows[0].city).toBe("LA"); 

            });
     });
    
     describe('Update user bio ',()=>{
             test('should update user bio successfully', async () => {
                    
                      // Make a request to your API to update the bio, using the valid JWT token
                      const response = await request(app)
                      .put('/api/users/put/bio')
                      .set('Authorization', `Bearer ${validJwtTokenChef}`)  
                      .send({ bio:"updated bio" });
            
                  // Verify the response
                  expect(response.status).toBe(200);
                  expect(response.body.message).toBe('bio updated successfully');
            
                  // Verify that the user's bio was updated in the database
                  const [rows] = await mysqlPool.query('SELECT bio FROM chefs WHERE user_id = ?', [testUserIdChef]);
                  expect(rows.length).toBe(1);  // Make sure a row exists
                  expect(rows[0].bio).toBe("updated bio"); 
                 
    
                });


                test('should not update user bio successfully because user of type cutomer', async () => {
                    
                    // Make a request to your API to update the bio, using the valid JWT token
                    const response = await request(app)
                    .put('/api/users/put/bio')
                    .set('Authorization', `Bearer ${validJwtTokenCustomer}`)  
                    .send({bio:"should not be updated "});
          
                // Verify the response
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('user must be of type chef to update bio');
          
                
  
              });
     });   

     describe('Update user password',()=>{
        test('should update user password successfully', async () => {
            const response = await request(app)
            .put('/api/users/put/password ')
            .set('Authorization', `Bearer ${validJwtTokenChef}`)  
            .send({oldPassword:"password123",newPassword:"sdfgdfg4564645"});
           
  
           // Verify the response
          expect(response.status).toBe(200);
          expect(response.body.message).toBe('password updated successfully');
          });
                 
        
           test('should not update user password successfully because user password does not match entered password', async () => {
            const response = await request(app)
            .put('/api/users/put/password ')
            .set('Authorization', `Bearer ${validJwtTokenChef}`)  
            .send({oldPassword:"123",newPassword:"456465467"});
           // Verify the response
          expect(response.status).toBe(400);
          expect(response.body.message).toBe('Password is incorrect');
       
         });

         test('should not update user password successfully because new password or old password is invalid', async () => {
            const response = await request(app)
            .put('/api/users/put/password ')
            .set('Authorization', `Bearer ${validJwtTokenChef}`)  
            .send({oldPassword:"password123",newPassword:"456"});
           // Verify the response
          expect(response.status).toBe(404);
          expect(response.body.message).toBe('old or new password are invalid');
               
     
           

         });
        });

    describe('follow chef',()=>{
         test('should follow chef successfully', async () => {

               // Make a request to your API to follow chef, using the valid JWT token
               const response = await request(app)
               .post(`/api/users/follow/${testUserIdChef}`)
               .set('Authorization', `Bearer ${validJwtTokenCustomer}`);  
         
           // Verify the response
           expect(response.status).toBe(200);
           expect(response.body.message).toBe('followed chef successfully');
     
           // Verify that the customer followed chef 
           const [rows] = await mysqlPool.query('SELECT * FROM followers WHERE chef_id = ? and customer_id = ?', [testUserIdChef,testUserIdCustomer]);
           expect(rows.length).toBe(1);  // Make sure a row exists
           expect(rows[0].chef_id).toBe(testUserIdChef);   
           
            // Verify that that chef followers count and customer following count updated  
            const [rowsCustomer] = await mysqlPool.query('SELECT following_count FROM customers WHERE user_id = ?', [testUserIdCustomer]);
            const [rowsChef] = await mysqlPool.query('SELECT followers_count FROM chefs WHERE user_id = ?', [testUserIdChef]);
            expect(rowsCustomer[0].following_count).toBe(1); 
            expect(rowsChef[0].followers_count).toBe(1);    
      
         });
   
         test('should not follow chef successfully because chef id is invalid', async () => {
        // Make a request to your API to follow chef, using the valid JWT token but with invalid chef id
                const chefId=""
               const response = await request(app)
               .post(`/api/users/follow/${chefId}`)
               .set('Authorization', `Bearer ${validJwtTokenCustomer}`);  
     
           // Verify the response
           expect(response.status).toBe(404);
           expect(response.body.message).toBe('chef id not valid');
         });
    
        test('should not follow chef successfully because chef doesnot exist', async () => {
         // Make a request to your API to follow chef, using the valid JWT token but with  chef id that doesnot exist
            const chefId="0"
            const response = await request(app)
            .post(`/api/users/follow/${chefId}`)
            .set('Authorization', `Bearer ${validJwtTokenCustomer}`);  
  
        // Verify the response
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('user not found');
         });

        });
   
    describe('unfollow chef',()=>{
        beforeEach(async()=>{
        mysqlPool.query('insert into followers (customer_id, chef_id) VALUES (?, ?)',[testUserIdCustomer,testUserIdChef]);
        mysqlPool.query('UPDATE chefs SET followers_count = followers_count + 1 WHERE user_id = ?',[testUserIdChef]);
        mysqlPool.query('UPDATE customers SET following_count = following_count + 1 WHERE user_id = ?',[testUserIdCustomer]);
        const [result] =await mysqlPool.query('select * from followers where chef_id = ? and customer_id = ? ',[testUserIdChef,testUserIdCustomer]);
         console.log("following list",result[0]);   
        });

    
            test('should unfollow chef successfully', async () => {
                // Make a request to your API to unfollow chef, using the valid JWT token
             const response = await request(app)
             .delete(`/api/users/unfollow/${testUserIdChef}`)
             .set('Authorization', `Bearer ${validJwtTokenCustomer}`);  
         
           // Verify the response
           expect(response.status).toBe(200);
           expect(response.body.message).toBe('unfollowed chef successfully');
     
           // Verify that a customer unfollowed a chef 
           const [rows] = await mysqlPool.query('SELECT * FROM followers WHERE chef_id = ? and customer_id = ?', [testUserIdChef,testUserIdCustomer]);
           expect(rows.length).toBe(0);  // Make sure a row does not exists

            // Verify that that chef followers count and customer following count updated  
            const [rowsCustomer] = await mysqlPool.query('SELECT following_count FROM customers WHERE user_id = ?', [testUserIdCustomer]);
            const [rowsChef] = await mysqlPool.query('SELECT followers_count FROM chefs WHERE user_id = ?', [testUserIdChef]);
            expect(rowsCustomer[0].following_count).toBe(0); 
            expect(rowsChef[0].followers_count).toBe(0);    
            });
       
       
            test('should not unfollow chef successfully because chef id is invalid', async () => {
                //const chefId;

                const response = await request(app)
                .delete(`/api/users/unfollow/`)
                .set('Authorization', `Bearer ${validJwtTokenCustomer}`);  
            
              // Verify the response
              expect(response.status).toBe(404);
              expect(response.body.message).toBe('chef id not valid');
    
            });
       
           test('should not unfollow chef successfully because chef doesnot exist', async () => {
                      const chefId="0"

                      const response = await request(app)
                .delete(`/api/users/unfollow/${chefId}`)
                .set('Authorization', `Bearer ${validJwtTokenCustomer}`);  
            
              // Verify the response
              expect(response.status).toBe(500);
              expect(response.body.message).toBe('user not found');
      
            });  








            
        });

     describe('get following',()=>{
        
                test('should get following successfully', async () => {
                    // Make a request to your API to get customer following, using the valid JWT token
                 const response = await request(app)
                 .get("/api/users/following")
                 .set('Authorization', `Bearer ${validJwtTokenCustomer}`);  
             
               // Verify the response
               expect(response.status).toBe(200);
                });
           
           
                // test('should not get following successfully', async () => {
                  
        
                // });
           
                
            });

         

                

                
                
                

            
   



});