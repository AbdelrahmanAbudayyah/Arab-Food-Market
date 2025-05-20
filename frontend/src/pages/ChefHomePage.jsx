import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

import axiosInstance from'../axiosInstance';
import './css/chefHomePage.css';
import AddFoodModal from '../components/AddEditFoodPopup/AddFoodItem'; 
import EditFoodModal from '../components/AddEditFoodPopup/EditFoodItem'; 

export default function ChefPage() {
  const [foodItems, setFoodItems] = useState([]);
  const { user } = useAuth();
  const [chef, setChef] = useState(null);
  const initialFoodItem = {
    name:'',
    description:'',
    price:1,
    image_url:'',
    id:'',
    chef_Id:'',
    category:'main'
  };
  const [foodItem, setFoodItem]= useState({
    name:'',
    description:'',
    price:1,
    image_url:'',
    id:'',
    chef_Id:'',
    category:'main'

  });
  const [isEditing, setIsEditing] = useState(false); 
  const [isAddFoodModalVisible, setIsAddFoodModalVisible] = useState(false); 
  const [isEditFoodModalVisible, setIsEditFoodModalVisible] = useState(false);
  useEffect(() => {
    fetchChefDetails();
  }, [user]);

  const fetchChefDetails = async () => {
    try {
      const res1 = await axiosInstance.get(`/users/user/${user.id}`,{
        withCredentials: true 
      });
      setChef(res1.data);

      const res2 = await axiosInstance.get(`/foodItems/get/${user.id}`,{
        withCredentials: true 
      });
      setFoodItems(res2.data);
    } catch (err) {
      console.error('Error fetching chef details', err);
    }
  };

  const handleAddFoodItem= async()=>{
    const formData = new FormData();
    formData.append('name', foodItem.name);
    formData.append('description', foodItem.description);
    formData.append('price', foodItem.price);
    formData.append('image_url', foodItem.image_url); 
    formData.append('chef_id', user.id); 
    formData.append('category', foodItem.category); 

    try{
    const res = await axiosInstance.post('/foodItems/add', formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const newFoodItem = { ...foodItem, id: res.data.id};  // Combine the returned id with the existing food data
    setFoodItems(prev => [...prev, newFoodItem]); // res.data should be the newly created food item
    setIsAddFoodModalVisible(false);


    }catch (err) {
        if (err.response?.status === 401) {
          try {
            await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

            const res = await axiosInstance.post('/foodItems/add', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              const newFoodItem = { ...foodItem, id: res.data.id,chef_Id:user.id };  // Combine the returned id with the existing food data
              
              setFoodItems(prev => [...prev,newFoodItem ]); // res.data should be the newly created food item
              setIsAddFoodModalVisible(false); 

           
          } catch (refreshError) {
            console.error('Token refresh failed or retry failed:', refreshError);
          }
        } else {
          console.error('update error:', err);
        }
      }
    };

  const handleDeleteFoodItem= async(foodItemId)=>{

        try{
            const res =await axiosInstance.delete(`/foodItems/delete/${foodItemId}`,{
                withCredentials: true
            });
    
            setFoodItems(prev => prev.filter(item => item.id !== foodItemId));
    
        }catch (err) {
            if (err.response?.status === 401) {
                try{
                    await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

                    const res =await axiosInstance.delete(`/foodItems/delete/${foodItemId}`,{
                        withCredentials: true
                    });
            
                    setFoodItems(prev => prev.filter(item => item.id !== foodItemId));
               
              } catch (refreshError) {
                console.error('Token refresh failed or retry failed:', refreshError);
              }
            } else {
              console.error('delete error:', err);
            }
          }
        };

  const handleUpdateFoodItem= async(foodItem)=>{
    const formData = new FormData();
    formData.append('name', foodItem.name);
    formData.append('description', foodItem.description);
    formData.append('price', foodItem.price);
    formData.append('chef_id', user.id); 
    formData.append('category', foodItem.category);
    if (foodItem.image_url instanceof File) {
      formData.append('image_url', foodItem.image_url);
    }
            try{
                const res =await axiosInstance.put(`/foodItems/put/${foodItem.id}`,formData,{
                    withCredentials: true
                });
                 // Replace the old item with the updated one in state
                setFoodItems(prev =>
                    prev.map(item =>
                    item.id === foodItem.id ? foodItem : item
                    )
                );
            }catch (err) {
                if (err.response?.status === 401) {
                    try{
                        await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

                        const res =await axiosInstance.put(`/foodItems/put/${foodItem.id}`,formData,{
                            withCredentials: true
                        });

                        setFoodItem(prev => ({ ...prev, image_url: res.data.image_url }));

                
                         // Replace the old item with the updated one in state
                            setFoodItems(prev =>
                                prev.map(item =>
                                item.id === foodItem.id ? foodItem : item
                                )
                            );
                   
                  } catch (refreshError) {
                    console.error('Token refresh failed or retry failed:', refreshError);
                  }
                } else {
                  console.error('delete error:', err);
                }
              }
            };

  const handleChange = (e) => {
                const { name, value, files } = e.target;
                if (name === 'image_url') {
                  setFoodItem((prev) => ({
                    ...prev,
                    image_url: files[0], 
                  }));
                } else {
                  setFoodItem(prev => ({ ...prev, [name]: value }));
                }
              };
  const toggleAddFoodModalModal = () => {
               setFoodItem(initialFoodItem);
                setIsAddFoodModalVisible(!isAddFoodModalVisible); 
              };

 const toggleEditFoodModalModal = () => {
   setIsEditFoodModalVisible(!isEditFoodModalVisible); 
               };         

const handleEditClick = (item) => {
    setFoodItem(item); 
    setIsEditFoodModalVisible(true);
  };
   
  return (
    <div className="chef-menu">
      <div className="chef-profile">
        {chef && (
          <div className="chef-header">
            <img
              src={
                chef.image_url
                  ? `${process.env.REACT_APP_API_URL}${chef.image_url}`
                  : '/default-profile.png'
              }
              alt="Chef"
              className="chef-image"
            />
            <h2>{chef.name}</h2>
            <p className="chef-bio">{chef.bio}</p>
            <p className="chef-followers">Followers: {chef.followers_count}</p>
          </div>
        )}
  
        <button className='edit-button' onClick={() => setIsEditing(prev => !prev)}>Edit Mode</button>
        {isEditing && (
          <button  onClick={toggleAddFoodModalModal}>Add Food Item</button>
        )}
  
        {/* Add Food Modal */}
        <AddFoodModal
          show={isAddFoodModalVisible}
          closeModal={toggleAddFoodModalModal}
          handleAddFoodItem={handleAddFoodItem}
          foodItem={foodItem}
          handleChange={handleChange}
        />
  
        {/* Edit Food Modal */}
        <EditFoodModal
          show={isEditFoodModalVisible}
          closeModal={toggleEditFoodModalModal}
          handleUpdateFoodItem={handleUpdateFoodItem}
          foodItem={foodItem}
          handleChange={handleChange}
        />
  
        <hr />
  
       {/* Food Sections */}
<div className="food-menu">
  <h3 className='menu'>Menu</h3>
  {['main', 'side', 'dessert'].map(section => {
    const sectionItems = foodItems.filter(item => item.category === section);
    return sectionItems.length > 0 ? (
      <div key={section} className="menu-section">
        <h4 className="menu-section-title">{section.toUpperCase()}</h4>
        <div className="food-carousel">
          {sectionItems.map(item => (
            <div key={item.id} className="food-card">
              <img
                src={
                  item.image_url
                    ? `${process.env.REACT_APP_API_URL}${item.image_url}`
                    : '/default-profile.png'
                }
                alt={item.name}
                className="food-img"
              />
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <p>${item.price}</p>

              {isEditing && (
                <>
                  <button onClick={() => handleEditClick(item)}>Edit</button>
                  <button onClick={() => handleDeleteFoodItem(item.id)}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null;
  })}
</div>

      </div>
    </div>
  );
  
}
