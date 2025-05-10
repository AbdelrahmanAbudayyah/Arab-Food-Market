const mysqlPool = require('../config/mysql-db').mysqlPool;
const{getUserById}= require('../models/userModel');

 const validateSignUpInput = (userData) => {
  const { name, email, password, state, city, image_url, type } = userData;

  if (!name || !email || !password || !type) {
    throw new Error('Missing required fields');
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Password strength (example: at least 6 characters)
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if type is valid
  if (!['chef', 'customer'].includes(type)) {
    throw new Error('Invalid user type');
  }

  // (Optional) validate state/city/image_url if you want

  return true; // Passed validation

};
const validateOrderData = (total,items)=>{

  if (!total || !items || !Array.isArray(items) || items.length === 0) {
    console.log(total);
    console.log(items[0]);

    throw new Error("Missing required fields"); 
  }
  for (const item of items) {
    const { id, quantity } = item;
    if (!id || !quantity) {
      console.log({id},':',quantity);
      throw new Error("Each item must have a food_id and quantity");
    }
  }
 return true;

};

const validateFoodData = (userData) => {
  const { name,price,category } = userData;

  if (!name || !price) {
    console.log(name,price);
    throw new Error('Missing required fields');
  }
  
  return true; 
};

const validateIfUserExist = async(userId)=>{
  try{
    console.log("userid: " , userId);
  const user = await getUserById(userId);
  if(!user)
    throw new Error('user not found');
  }catch(error){
    console.error(error);
    throw new Error('user not found');       
  }
};

const validateIfOrderExist = async(orderId)=>{

try {
  const [result] = await mysqlPool.query("select id from orders where id = ? ",[orderId]);

if(result.length == 0){
  throw new Error('order not found');
}
} catch (error) {
  console.error(error);
  throw new Error('order not found');    
  
}

};
module.exports={validateOrderData,validateSignUpInput,validateIfUserExist,validateFoodData,validateIfOrderExist};
