const {addFoodItem,deleteFoodItem,updateFoodItem,getAllFoodItemsByChef,getFoodItemById} = require('../models/foodItemsModel');
const {validateFoodData} = require("../utils/validateInput");

// Controller to handle HTTP POST for adding a food item
const addFoodItemController = async(req,res)=>{
    const {id}=req.user;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const foodData = {
        ...req.body,
        image_url,
      };
    try{

        validateFoodData(foodData);
        const result = await addFoodItem(id,foodData);
        console.log(result.foodId);

        res.status(200).json({message:result.message,id:result.foodId});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP DELETE for deleting a food item
const deleteFoodItemController = async(req,res)=>{
    const {foodId}=req.params;
   // const {id}=req.user;

    try{
        const [foodItem]= await getFoodItemById(foodId);
        if(!foodItem){
            return res.status(404).json({message:"food id doesnot exist"});
        }
        const result = await deleteFoodItem(foodId);
        res.status(200).json({message:result.message,});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP PUT for updating a food item
const updateFoodItemController = async(req,res)=>{
    const {foodId}=req.params;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const foodData = {
        ...req.body,
        image_url,
      };
    try{
        console.log("image_url;",image_url);
        const [foodItem]= await getFoodItemById(foodId);
        if(!foodItem){
            return res.status(404).json({message:"food id doesnot exist"});
        }

        validateFoodData(foodData);
        const result = await updateFoodItem(foodId,foodData);
        res.status(200).json({message:result.message});
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};

// Controller to handle HTTP GET for getting all food items for chef
const getFoodItemController = async(req,res)=>{
    
    const {chefId}=req.params;
    try{
        if(!chefId)
            return res.status(404).json({message:"chef id doesnot exist"});
        const result = await getAllFoodItemsByChef(chefId);
        res.status(200).json(result);
    }catch(error){
        console.error(error);
        res.status(500).json({message:error.message});
    }
};





module.exports={addFoodItemController,deleteFoodItemController,updateFoodItemController,getFoodItemController};