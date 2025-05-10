const {mysqlPool} = require('../config/mysql-db');


//create a new order
const submitOrder = async (userData) => {
    const { customerId, chefId, total, items } = userData; // items = [{ food_id, quantity }, ...]
    try {
        await mysqlPool.query('START TRANSACTION');

        // Step 1: Insert into `orders` table
        const [orderResult] = await mysqlPool.query(
            "INSERT INTO orders (customer_id, chef_id, total) VALUES (?, ?, ?)",[customerId, chefId, total]);

        const orderId = orderResult.insertId;

        // Step 2: Insert into `order_food` table (bulk insert)
        const orderItems = items.map(({ id, quantity,name,price }) => [orderId, id, quantity,name,price]);
        await mysqlPool.query("INSERT INTO order_food (order_id, food_id, quantity,food_name,food_price) VALUES ?",[orderItems]);

        await mysqlPool.query('COMMIT');
        return({ message: "Order submitted successfully", orderId });
    } catch (error) {
        await mysqlPool.query('ROLLBACK');
        console.error("Error submitting order:", error);
        throw new Error("error in submiting order model");
    }
};

//a chef can decline or accept a pending order
const declineOrAcceptOrder = async (status,orderId) => {
    
    try {
        await mysqlPool.query("UPDATE orders SET status = ? WHERE id = ?",[status, orderId]);
        return({ message: "Order status changed successfully", status:status });
    } catch (error) {
        console.error("Error accepting or declining order:", error);
        throw new Error("error in accepting or declining order model");
    }
};


//get all orders for a chef
const getOrders4Chef = async (userId) => {
    try {
        const [rows] = await mysqlPool.query(`
            SELECT
                u.id, 
                u.name, 
                o.created_at, 
                o.total,
                o.status,
                o.id AS order_id
            FROM 
                orders o
            JOIN 
                users u ON o.customer_id = u.id
            WHERE 
                o.chef_id = ?`, [userId]);
        
        console.log(rows);        
        return rows;
    } catch (error) {
        console.error("Error gettingOrders4Chef:", error);
        throw new Error("error in getting Orders 4 Chef model");
    }
};

//get all orders for a customer
const getOrders4Customers = async (userId) => {
    try {
        const [rows] = await mysqlPool.query(`
            SELECT 
                u.id, 
                u.name, 
                o.created_at, 
                o.total,
                o.status,
                o.id As order_id
            FROM 
                orders o
            JOIN 
                users u ON o.chef_id = u.id
            WHERE 
                o.customer_id = ?`, [userId]);
        
        return rows;
    } catch (error) {
        console.error("Error gettingOrders4Customers:", error);
        throw new Error("error in getting Orders 4 Customers model");
    }
};

//get information for a specific order
const getOrderById = async (orderId) => {
    try {

        const [rows] = await mysqlPool.query(
            `SELECT 
                    o.id AS order_id,
                    o.chef_id,
                    o.customer_id,
                    u1.name AS chef_name,
                    u2.name AS customer_name,
                    o.created_at AS order_date,
                    o.total AS order_total,
                    o.status AS order_status,
                    ofr.food_name AS item_name,
                    ofr.food_price AS item_price,
                    ofr.quantity AS item_quantity
                FROM 
                    orders o
                JOIN 
                    users u1 ON o.chef_id = u1.id
                JOIN 
                    users u2 ON o.customer_id = u2.id    
                JOIN 
                    order_food ofr ON o.id = ofr.order_id
                
                WHERE 
                    o.id = ?
                `, [orderId]
        );

        if (rows.length === 0) {
            return null; // or throw an error if order not found
          }
          
          const orderDetails = {
            id: rows[0].order_id,
            chef_name: rows[0].chef_name,
            chef_id: rows[0].chef_id,
            customer_name: rows[0].customer_name,
            customer_id: rows[0].customer_id,
            date: rows[0].order_date,
            total: rows[0].order_total,
            status: rows[0].order_status,
            items: rows.map(row => ({
              name: row.item_name,
              price: row.item_price,
              quantity: row.item_quantity
            }))
          };
          console.log(orderDetails);
          return orderDetails;
    } catch (error) {
        console.error("Error in gettingOrderById:", error);
        throw new Error("error in getting order by id model");
    }
};




module.exports= {submitOrder,declineOrAcceptOrder,getOrders4Chef,getOrders4Customers,getOrderById};