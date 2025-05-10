const express=require('express');
const authenticateUser = require("../middleware/authMiddleware");
const router = express.Router();

const {submitOrderController,declineOrAcceptOrderController,getOrders4ChefController,getOrders4CustomerController,getOrderByIdController}= require('../controllers/ordersController');

router.post('/add',authenticateUser,submitOrderController);    // POST /api/orders/add - add a new order
router.put('/put/:orderId',authenticateUser,declineOrAcceptOrderController);    // PUT /api/orders/put/orderID - accept/decline order

router.get('/get/chef',authenticateUser,getOrders4ChefController);    // GET /api/orders/get/chef - get all chef orders
router.get('/get/customer',authenticateUser,getOrders4CustomerController);    // GET /api/orders/get/customer - get all customer orders
router.get('/get/:orderId',authenticateUser,getOrderByIdController);    // GET /api/orders/get/:orderId - get order by id





module.exports =router;