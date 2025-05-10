const express=require('express');
const authenticateUser = require("../middleware/authMiddleware");
const router = express.Router();

const multer= require('multer');

// Save file using multer diskStorage
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage });

const {addFoodItemController,deleteFoodItemController,updateFoodItemController,getFoodItemController}= require('../controllers/foodItemsController');


router.post('/add',authenticateUser,upload.single('image_url'),addFoodItemController);    // POST /api/foodItems/add - add a new food item
router.delete('/delete/:foodId',authenticateUser,deleteFoodItemController);    // DELETE /api/foodItems/delete/:foodId - delete afood item
router.put('/put/:foodId',authenticateUser,upload.single('image_url'),updateFoodItemController);    // PUT /api/foodItems/put/:foodId - update a food item
router.get('/get/:chefId',getFoodItemController);    // Get /api/foodItems/get/ - get food items for chef



module.exports =router;


