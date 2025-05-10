const bcrypt = require('bcrypt');
const {getChefs,followChef,getFollowing,unfollowChef,createUser,getUserById,getUserPassword,getUserByEmail,deleteUser,updateUserName,updateUserPassword,updateUserImage,updateUserBio,updateUserAddress} = require('../models/userModel');
const { generateToken, generateRefreshToken } = require("../utils/jwt");
const {validateSignUpInput,validateIfUserExist}= require("../utils/validateInput");


// Controller to handle HTTP POST for creating User
const signUpUserController = async(req,res)=>{
   // console.log(req.file);
 

const { name, email, password, state, city,type} = req.body;
const additionalData = JSON.parse(req.body.additionalData || '{}');

const image_url = req.file ? `/uploads/${req.file.filename}` : null;
try{
    validateSignUpInput({ name, email, password, state, city, image_url, type });
    const found = await getUserByEmail(email);
    if (found) {
      return res.status(400).json({ message: "Email already exists, choose another email" });
    }
     // Hash the password before storing
    const saltRounds =10;
    const hashedPassword= await bcrypt.hash(password,saltRounds);

   // Store user in DB
   const user = await createUser({
    name,
    email,
    password: hashedPassword,
    state,
    city,
    image_url,
    type,
    additionalData,
});
// Generate JWT tokens
const accessToken = generateToken(user);
const refreshToken = generateRefreshToken(user);

// Set cookies (HTTP-only for security)
res.cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 15 * 60 * 1000 }); // 15 min
res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    res.status(201).json(
        {
            message:'user created',
                user:{
                     id: user.id,
                     name: user.userData.name,
                     email: user.userData.email,
                     state: user.userData.state,
                     city: user.userData.city,
                     image_url:user.userData.image_url,
                     type:user.userData.type,
                     additionalData:user.userData.additionalData
                }
        }
    
    );
}
catch(error){
    console.error(error);
    res.status(500).json({message:error.message}); 
}
};

// Controller to handle HTTP POST for login exisitng User
const loginUserByEmailController = async(req,res)=>{
    const{email,password}=req.body;
    try{
        if(!email || !password)
            return res.status(404).json({message:'email or password are missing'});

        const user = await getUserByEmail(email);
        if(!user) {
            return res.status(404).json({message:'User not found'});
        }

         // Compare entered password with hashed password
         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
             return res.status(400).json({ message: 'Password is incorrect' });
         }

         // Generate JWT tokens
        const accessToken = generateToken(user);
        //console.log("access token : ",accessToken);
        const refreshToken = generateRefreshToken(user);

        // Set cookies (HTTP-only for security)
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "strict", maxAge:  15 * 60 * 1000 }); // 15 min
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days  
         //console.log(res.cookie);
        res.status(200).json({
            message:"login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                state: user.state,
                city: user.city,
                type:user.type,
                image_url:user.image_url,
                bio:user.bio || null,
                followers_count:user.followers_count||null
            
              }
        });
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP DELETE for deleting exisitng User
const deleteUserController = async(req,res)=>{
    const userId = req.user.id; 
    const {password} = req.body;
    try{


        if(!userId)
            return res.status(404).json({message:'id is invalid'});

        if(!password)
            return res.status(404).json({message:'password is missing'});

        const userPassword = await getUserPassword(userId);
        //
        // Compare entered password with hashed password
         const isMatch = await bcrypt.compare(password, userPassword);
         if (!isMatch) {
             return res.status(400).json({ message: 'Password is incorrect' });
         }

        const result = await deleteUser(userId);

        if(!result.success){
            return res.status(404).json({ message: result.message });
        }
        res.status(200).json({message:result.message});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP PUT for updating  User name
const updateUserNameController = async(req,res)=>{
    const {name}=req.body;
    const {id}=req.user;

    if(!id)
        return res.status(404).json({message:'id is invalid'});
    // Validate that the name is not empty
  if (!name) {
    return res.status(400).json({ message: 'Name cannot be empty' });
  }
    try{
        const result = await updateUserName({id, name});
        res.status(200).json({message:result.message,});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP PUT for updating  User name
const updateUserImageController = async(req,res)=>{
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const {id}=req.user;
    console.log("image_url;",image_url);

    try{
        if(!id)
            return res.status(404).json({message:'id is invalid'});
        const result = await updateUserImage({id, image_url});
        res.status(200).json({message:result.message,image_url:image_url});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP PUT for updating  User address
const updateUserAddressController = async(req,res)=>{
    const {state,city}=req.body;
    const {id}=req.user;
    try{
        if(!id)
            return res.status(404).json({message:'id is invalid'});
        const result = await updateUserAddress({id,state,city});
        res.status(200).json({message:result.message,});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP PUT for updating  User bio
const updateUserBioController = async(req,res)=>{
    const {bio}=req.body;
    const {id}=req.user;

    try{
        if(!id)
            return res.status(404).json({message:'id is invalid'});
        const currentUser = await getUserById(id);
        if(currentUser.type !== 'chef'){
            return res.status(404).json({message:"user must be of type chef to update bio"});
        }
        const result = await updateUserBio({id, bio});
        res.status(200).json({message:result.message,});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP PUT for updating  User password
const updateUserPasswordController = async(req,res)=>{
    const {oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    try{
        if(!userId)
            return res.status(404).json({message:'id is invalid'});

        if(!oldPassword || !newPassword || newPassword.length < 6 )
            return res.status(404).json({message:'old or new password are invalid'});

        const password =await getUserPassword(userId);
        
        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(oldPassword, password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        const result = await updateUserPassword(req.user.id, hashedPassword);
        res.status(200).json({message:result.message,});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

//Controller to handle HTTP POST for a customer to follow a chef 
const followChefController = async(req,res)=>{
    const {chefId}=req.params;
    const userId = req.user.id;
    //console.log("userId from cookie:",userId);
    try{
        if(!userId)
            return res.status(404).json({message:'user id is invalid'});
        if(!chefId)
            return res.status(404).json({message:"chef id not valid"})

        await validateIfUserExist(chefId);
        
        const result=await followChef(userId,chefId);
        res.status(200).json({message:result.message});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:error.message}); 
    }
    };


    //Controller to handle HTTP DELETE for a customer to unfollow a chef 
const unfollowChefController = async(req,res)=>{
    const {chefId}=req.params;
    const userId = req.user.id;

    try{
        if(!userId)
            return res.status(404).json({message:'user id is invalid'});
        if(!chefId)
            return res.status(404).json({message:"chef id not valid"})

        await validateIfUserExist(chefId);
        const result=await unfollowChef(userId,chefId);
        res.status(200).json({message:result.message});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:error.message}); 
    }
    };

   
    //Controller to handle HTTP GET for getting following list 
const getfollowingController = async(req,res)=>{
    const userId = req.user.id;
    try{
        if(!userId)
            return res.status(404).json({message:'user id is invalid'});

        const result=await getFollowing(userId);
        res.status(200).json(result);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:error.message}); 
    }
    };

const getUserByIdController = async(req,res)=>{
    const {userId}=req.params;
    try{
        if(!userId)
            return res.status(404).json({message:"no user id"});
        const user=await getUserById(userId);
        res.status(200).json(user);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:error.message}); 
    }
    };

    const getChefsController = async(req,res)=>{
        const { name, city, state } = req.query;
        try{
            if(!name && !city && !state)
                return res.status(404).json({message:'no filters specified'});
    
            const result=await getChefs({ name, city, state });
            res.status(200).json(result);
        }
        catch(error){
            console.error(error);
            res.status(500).json({message:error.message}); 
        }
        };    


module.exports={getChefsController,signUpUserController,getfollowingController,unfollowChefController,followChefController,getUserByIdController,updateUserAddressController,updateUserBioController,updateUserPasswordController,loginUserByEmailController,deleteUserController,updateUserNameController,updateUserImageController};