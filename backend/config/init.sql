/* create tables if they dont exist when running docker compose*/

/* users */

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    state VARCHAR(255) NULL,
    city VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    type ENUM('chef', 'customer') NOT NULL
);

/* chefs */

CREATE TABLE IF NOT EXISTS chefs (
    user_id INT PRIMARY KEY,
    bio TEXT NULL, 
    specialty VARCHAR(255) NULL,
    followers_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


/* customers */

CREATE TABLE IF NOT EXISTS customers (
    user_id INT PRIMARY KEY,
    following_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

/* followers */ 

CREATE TABLE IF NOT EXISTS followers (
    customer_id INT NOT NULL,
    chef_id INT NOT NULL,
    PRIMARY KEY (customer_id, chef_id),
    FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (chef_id) REFERENCES chefs(user_id) ON DELETE CASCADE
);

/* food items */ 

CREATE TABLE IF NOT EXISTS food_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chef_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(255) NOT NULL,

    image_url VARCHAR(255) NULL,
    FOREIGN KEY (chef_id) REFERENCES chefs(user_id) ON DELETE CASCADE
);



/* orders */

CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    chef_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'canceled') DEFAULT 'pending',
    total DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (chef_id) REFERENCES chefs(user_id) ON DELETE CASCADE
);

/* order items */

CREATE TABLE IF NOT EXISTS order_food (
    order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    food_name VARCHAR(255) NOT NULL,
    food_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, food_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
);



