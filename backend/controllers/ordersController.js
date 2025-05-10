const {submitOrder,declineOrAcceptOrder,getOrders4Chef,getOrders4Customers,getOrderById,} = require('../models/ordersModel');
const {validateIfOrderExist,validateOrderData,validateIfUserExist} = require('../utils/validateInput');


//create a new order
const submitOrderController = async(req,res)=>{
    const customerId = req.user.id;
    const { chefId, total, items } = req.body;
   console.log(customerId);

    const userData = {customerId,chefId,total,items};
    try{
        validateOrderData(total,items);
        // method to check if chef exist with this id 
        await  validateIfUserExist(chefId);
        
         const result=await submitOrder(userData);
         res.status(200).json(result);
     }catch(error){

         console.error(error);
         res.status(500).json({message:error.message}); 
        }
 };

//accept or decilne a pending order
const declineOrAcceptOrderController = async(req,res)=>{
    const {status} = req.body;
    const {orderId}=req.params;
    try{
        // check if status exist 
        if(!status || (status !== "confirmed" && status !== "canceled")){
            console.log("status isnide check status",status);
            return res.status(404).json({message:"status invalid"});
        };

        // check if order exist
       await validateIfOrderExist(orderId);

        
        console.log("status before going to back end",status);
         const result=await declineOrAcceptOrder(status,orderId);
         res.status(200).json(result);
     }catch(error){

         console.error(error);
         res.status(500).json({message:error.message}); 
        }
 };

 //get all orders for a chef
 const getOrders4ChefController = async(req,res)=>{
    const userId = req.user.id;;
    try{
         const result=await getOrders4Chef(userId);
         res.status(200).json(result);
     }catch(error){

         console.error(error);
         res.status(500).json({message:error.message}); 
        }
 };

//get all orders for a customer
const getOrders4CustomerController = async(req,res)=>{
    const userId = req.user.id;
    try{
         const result=await getOrders4Customers(userId);
         console.log(result)
         res.status(200).json(result);
     }catch(error){

         console.error(error);
         res.status(500).json({message:error.message}); 
        }
 };

//get information for a specific order
const getOrderByIdController = async(req,res)=>{
    const {orderId}=req.params;
    try{
        if(!orderId)
            return res.status(404).json({message:"orderId not valid"});

        await validateIfOrderExist;
        
         const result=await getOrderById(orderId);
         res.status(200).json(result);
     }catch(error){

         console.error(error);
         res.status(500).json({message:error.message}); 
        }
 };





module.exports={submitOrderController,declineOrAcceptOrderController,getOrders4ChefController,getOrders4CustomerController,getOrderByIdController}