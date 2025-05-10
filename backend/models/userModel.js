const {mysqlPool} = require('../config/mysql-db');

    //sign up for a new user
    const createUser= async(userData)=>{
        console.log(userData);
    const {name,email,password,state,city,image_url,type,additionalData}= userData;
    try{
       await mysqlPool.query('START TRANSACTION');
    
        const [userResult]= await mysqlPool.query(
            'INSERT INTO users (name, email, password, state, city, image_url, type) VALUES (?, ?, ?, ?, ?, ?, ?)',[name,email,password,state,city,image_url,type]
        );
        
        const userId = userResult.insertId; 

        if (type === 'chef') {
            const followers_count=0;
            const { bio,specialty } = additionalData;
            await mysqlPool.query(
                'INSERT INTO chefs (user_id, bio, specialty, followers_count) VALUES (?, ?, ?, ?)', 
                [userId, bio, specialty,followers_count]);
        } else{
            const following_count  = 0;
            await mysqlPool.query(
                'INSERT INTO customers (user_id, following_count) VALUES (?, ?)', 
                [userId, following_count]);
    }
    await mysqlPool.query('COMMIT');
    return { id: userId, userData };
}
    catch(error){
        await mysqlPool.query('ROLLBACK');
        console.error(error);
        throw new Error("error in creating user model");    }
    };

    //log in for existing user
    const getUserByEmail= async(email)=>{
    try{
        const [users] = await mysqlPool.query('select * from users where email = ? ',[email]);
        const user = users[0];

        if(user?.type ==='chef'){
        const [chefs]= await mysqlPool.query('select * from chefs where user_id = ?',[user?.id]);
        const chef = chefs[0];
            if(chef)
                return {...user, ...chef};
        }
        return user;
    }
    catch(error){
        console.error(error);
        throw new Error("error in getting user model");
    }
    };

    const getUserPassword= async(userId)=>{
        try{
            const [rows]= await mysqlPool.query('select password from users where id = ? ',[userId]);
            return rows[0].password;
        }
        catch(error){
            console.error(error);
            throw new Error("error in getting user password");
        }
    };

    //delete existing user
    const deleteUser= async(userId)=>{
        try{
            const [result]= await mysqlPool.query('DELETE FROM users WHERE id = ?',[userId]);
            if(result.affectedRows ===0){
                return {success: false, message:'user not found to delete'};
            }
            return {success: true, message:'user deleted'};

        }catch(error){
            console.error(error);
            throw new Error("error in deleting user model");
        }
    };

    //update user name
    const updateUserName= async(userData)=>{
        const{name,id}=userData;
        if(!id){
            throw new Error('User ID is required');

        }
        try{
            await mysqlPool.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
            return {message:'name updated successfully'};
        }
        catch(error){
            console.error(error);
            throw new Error("error in updating userName model");    }
    };

    //update user image
    const updateUserImage= async(userData)=>{
        const{image_url,id}=userData;
        try{
            await mysqlPool.query('UPDATE users SET image_url = ? WHERE id = ?', [image_url, id]);
            return {message:'image updated successfully'};
        }
        catch(error){
            console.error(error);
            throw new Error("error in updating userImage model");    }
    };

    //update user password
    const updateUserPassword= async(userId,password)=>{
        try{
            await mysqlPool.query('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
            return {message:'password updated successfully'};
        }
        catch(error){
            console.error(error);
            throw new Error("error in updating Password model");    }
    };

    //update chefBio but its called UserBio but only users of type chef have bio
    const updateUserBio= async(userData)=>{
        const{bio,id}=userData;
        try{
            await mysqlPool.query('UPDATE chefs SET bio = ? WHERE user_id = ?', [bio, id]);
            return {message:'bio updated successfully'};
        }
        catch(error){
            console.error(error);
            throw new Error("error in updating userbio model");    }
    };

    //update user city and state
    const updateUserAddress= async(userData)=>{
        const{state,city,id}=userData;
        try{
            await mysqlPool.query('UPDATE users SET state = ?, city = ? WHERE id = ?', [state,city,id]);
            return {message:'address updated successfully'};
        }
        catch(error){
            console.error(error);
            throw new Error("error in updating userAddress model");    }
    };


    //   **following and followers functions** \\

    //a customer follows a chef 
    const followChef= async(userId,chefId)=>{
        try{
            await mysqlPool.query('START TRANSACTION');
            // **in the future use database triggers to update follow count instead of manually doing it here **
            await mysqlPool.query('insert into followers (customer_id, chef_id) VALUES (?, ?)',[userId,chefId]);
            await mysqlPool.query('UPDATE chefs SET followers_count = followers_count + 1 WHERE user_id = ?',[chefId]);
            await mysqlPool.query('UPDATE customers SET following_count = following_count + 1 WHERE user_id = ?',[userId]);  
            
            await mysqlPool.query('COMMIT');
            return{message:"followed chef successfully"};
        }
        catch(error){
            await mysqlPool.query('ROLLBACK');
            console.error(error);
             throw new Error("error in following a chef user model");   
            }
        };

        //a customer unfollows a chef 
    const unfollowChef= async(userId,chefId)=>{
        try{
            await mysqlPool.query('START TRANSACTION');
            // **in the future use database triggers to update follow count instead of manually doing it here **
            await mysqlPool.query('DELETE FROM followers WHERE customer_id = ? AND chef_id = ?',[userId,chefId]);
            await mysqlPool.query('UPDATE chefs SET followers_count = followers_count - 1 WHERE user_id = ?',[chefId]);
            await mysqlPool.query('UPDATE customers SET following_count = following_count - 1 WHERE user_id = ?',[userId]);  
            
            await mysqlPool.query('COMMIT');
            return{message:"unfollowed chef successfully"};
        }
        catch(error){
            await mysqlPool.query('ROLLBACK');
            console.error(error);
            throw new Error("error in unfollowing a chef user model");    }
        };

           //get the following list of a customers 
    const getFollowing= async(userId)=>{
        try{
            const [result] = await mysqlPool.query(`
                SELECT 
                  u.id, 
                  u.name, 
                  u.image_url, 
                  u.state, 
                  u.city, 
                  c.bio
                FROM followers f
                JOIN chefs c ON f.chef_id = c.user_id
                JOIN users u ON f.chef_id = u.id
                WHERE f.customer_id = ?
              `, [userId]);
              
            
            return result;
        }
        catch(error){
            console.error(error);
            throw new Error("error in getting following user model");    }
        };

        const getChefs = async ({ name, city, state }) => {
            try {
              let query = `SELECT id, name, city, state, image_url FROM users WHERE type = 'chef'`;
              const params = [];
          
              if (name) {
                query += ` AND name LIKE ?`;
                params.push(`%${name}%`);
              }
              if (city) {
                query += ` AND city LIKE ?`;
                params.push(`%${city}%`);
              }
              if (state) {
                query += ` AND state LIKE ?`;
                params.push(`%${state}%`);
              }
          
              const [result] = await mysqlPool.query(query, params);
              return result;
            } catch (error) {
              console.error(error);
              throw new Error("Error in getting chefs with filters");
            }
          };
          



    
    //get user all infromation except password
    
    const getUserById= async(userId)=>{
        try{
            // First, get the user type
            const [users] = await mysqlPool.query('SELECT name, email, type, state, city, image_url FROM users WHERE id = ?',[userId]);
    
            
            if(users.length ===0)
                return null;
            let user=users[0];
            // If the user is a chef, get extra chef detail 
            if (user.type === 'chef') {
                 const [chefDetails] = await mysqlPool.query('SELECT followers_count, bio, specialty FROM chefs WHERE user_id = ?',[userId]);
                 user = { ...user, ...chefDetails[0] }; // Merge extra details
                }
        
            // If the user is a customer, get extra customer details
            else{
                const [customerDetails] = await mysqlPool.query('SELECT following_count FROM customers WHERE user_id = ?',[userId] );
                user = { ...user, ...customerDetails[0] }; // Merge extra details
                }
                return user;
        }catch(error){
            console.error(error);
            throw new Error("error in getting user model");}
        };





module.exports= {getChefs,createUser,getUserPassword,getUserById,getFollowing,unfollowChef,getUserByEmail,deleteUser,updateUserName,updateUserPassword,updateUserImage,updateUserBio,updateUserAddress,followChef};
