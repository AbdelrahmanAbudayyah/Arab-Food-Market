const {mysqlPool} = require('../config/mysql-db');

// a chef can add food item to his menu 
const addFoodItem=async(userId,foodData)=>{
    const{name, description,price,image_url,category}=foodData;
    try{
        console.log(category);
        const [res] =await mysqlPool.query('INSERT INTO food_items (chef_id, name, description, price,category,image_url) VALUES (?, ?, ?, ?,?,?)',[userId,name,description,price,category,image_url]);
        return {message:'food added successfully',foodId:res.insertId};

    }catch(error){
        console.error("MySQL Error in add foodModel:", error);
        throw new Error("error in adding food model");  }
};

// a chef can delete food item from his menu 
const deleteFoodItem=async(foodId)=>{
    try{
        const result = await mysqlPool.query('DELETE FROM food_items WHERE id = ?',[foodId]);
        return {message:'food deleted successfully'};

    }catch(error){
        console.error("MySQL Error in delete foodModel:", error);
        throw new Error("error in deleting food model");  }
};

// a chef can delete food item from his menu 
const updateFoodItem=async(foodId,foodData)=>{
    const{name, description,price,image_url,category}=foodData;
    try{
    if(image_url)
       await mysqlPool.query('UPDATE food_items SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?',[name,description,price,image_url,category,foodId]);
    else
        await mysqlPool.query('UPDATE food_items SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',[name,description,price,category,foodId]);

    return {message:'food updated successfully'};

    }catch(error){
        console.error("MySQL Error in update foodModel:", error);
        throw new Error("error in updating food model");  }
};

// get all food items for one cheff 
const getAllFoodItemsByChef=async(id)=>{
    try{
       const [result]= await mysqlPool.query('select * from food_items WHERE chef_id = ?',[id]);
        return result;

    }catch(error){
        console.error("MySQL Error in getting all food foodModel:", error);
        throw new Error("error in getting all food model");  }
};

// get one food item by item id
const getFoodItemById=async(id)=>{
    try{
       const [result]= await mysqlPool.query('select * from food_items WHERE id = ?',[id]);
        return result;

    }catch(error){
        console.error("MySQL Error in getting all food foodModel:", error);
        throw new Error("error in getting all food model");  }
};

module.exports={addFoodItem,deleteFoodItem,updateFoodItem,getAllFoodItemsByChef,getFoodItemById};