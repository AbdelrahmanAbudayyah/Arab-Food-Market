const express=require('express');
const {getChefsController,signUpUserController,getfollowingController,unfollowChefController,followChefController,getUserByIdController,updateUserBioController,updateUserAddressController,loginUserByEmailController,deleteUserController,updateUserNameController,updateUserPasswordController,updateUserImageController} = require('../controllers/userController');
const authenticateUser = require("../middleware/authMiddleware");
const multer= require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // resolves to /app/uploads in container
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const router = express.Router();

// http://localhost:


router.post('/signup',upload.single('image_url'),signUpUserController);    // POST /api/users/signup - Create a new user
router.post('/login',loginUserByEmailController); // POST /api/users/login - login

router.delete('/delete',authenticateUser,deleteUserController); // DELETE /api/users/delete - delete existing user

router.put('/put/name',authenticateUser,updateUserNameController); // PUT /api/users/put/name - update user name
router.put('/put/password',authenticateUser,updateUserPasswordController); // PUT /api/users/put/password - update user password
router.put('/put/image_url',upload.single('image_url'),authenticateUser,updateUserImageController); // PUT /api/users/put/image - update user image
router.put('/put/bio',authenticateUser,updateUserBioController); // PUT /api/users/put/bio - update user bio
router.put('/put/address',authenticateUser,updateUserAddressController); // PUT /api/users/put/address - update user address

router.post('/follow/:chefId',authenticateUser,followChefController);    // POST /api/users/follow - follow a chef
router.delete('/unfollow/:chefId',authenticateUser,unfollowChefController);    // DELETE /api/users/unfollow - unfollow a chef
router.get('/following',authenticateUser,getfollowingController);    // GET /api/users/following - get a list of the following

router.get('/chefs',getChefsController);    // GET /api/users/chefs - get a list of the chefs

router.get('/user/:userId',getUserByIdController);       // GET /api/users/user - get user info



module.exports =router;