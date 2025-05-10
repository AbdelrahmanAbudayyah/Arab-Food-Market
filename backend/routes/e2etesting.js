const express=require('express');
const router = express.Router();
const {mysqlPool} = require('../config/mysql-db');
const bcrypt = require('bcrypt');



router.post('/seed', async (req, res) => {
    console.log('inside test seed');
    try {
        await mysqlPool.query('DELETE FROM orders');
        await mysqlPool.query('DELETE FROM food_items');
        await mysqlPool.query('DELETE FROM chefs');
        await mysqlPool.query('DELETE FROM users');
    
        const hashedPassword = await bcrypt.hash('testpassword', 10);
    
        // Insert chef user
        const [chefResult] = await mysqlPool.query(
          `INSERT INTO users (name, type, email, password) VALUES (?, ?, ?, ?)`,
          ['Chef Mike', 'chef', 'chef@test.com', hashedPassword]
        );
    
        // Create corresponding chef entry
        await mysqlPool.query(
          `INSERT INTO chefs (user_id, bio) VALUES (?, ?)`,
          [chefResult.insertId, 'Test Chef Bio']
        );
    
        // Insert a food item
        await mysqlPool.query(
          `INSERT INTO food_items (name, price, chef_id, category) VALUES (?, ?, ?, ?)`,
          ['Kebab', 10, chefResult.insertId, 'main']
        );
    
        // Insert client user
        const [customerResult]= await mysqlPool.query(
          `INSERT INTO users (name, type, email, password) VALUES (?, ?, ?, ?)`,
          ['Test Client', 'customer', 'client@test.com', hashedPassword]
        );

        // Insert into customers table
await mysqlPool.query(
    `INSERT INTO customers (user_id) VALUES (?)`,
    [customerResult.insertId]
  );
    
        res.sendStatus(201);
      } catch (err) {
        console.error(err);
        res.sendStatus(500);
      }
    });
  
  
  router.post('/cleanup', async (req, res) => {
    try {
      // Delete from child tables first due to foreign key constraints
      await mysqlPool.query('DELETE FROM orders');
      await mysqlPool.query('DELETE FROM food_items');
      await mysqlPool.query('DELETE FROM chefs');
      await mysqlPool.query('DELETE FROM users');
  
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });






module.exports =router;