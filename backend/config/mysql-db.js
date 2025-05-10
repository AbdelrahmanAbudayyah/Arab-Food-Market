const mysql = require('mysql2/promise');

const isTestEnv = process.env.NODE_ENV === 'test'; // Check if in test environment


// MySQL Connection Pool
const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: isTestEnv ? process.env.MYSQL_TEST_DATABASE : process.env.MYSQL_DATABASE, // Use test DB for testing
    port: process.env.MYSQL_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to test MySQL connection
const connectDB = async () => {
    try {
        const connection = await mysqlPool.getConnection();
        console.log('✅ MySQL Connected');
        connection.release(); // Release connection back to the pool
    } catch (error) {
        console.error('❌ MySQL Connection Error:', error);
        process.exit(1);
    }
};

module.exports = { connectDB, mysqlPool };
