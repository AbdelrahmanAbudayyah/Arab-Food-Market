import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axiosInstance from'../axiosInstance';
import './css/chefMenu.css';

export default function ChefMenu() {
  const { id,name } = useParams();
  const navigate = useNavigate();

  const [chef, setChef] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const { user } = useAuth();
  let total;

  useEffect(() => {
    fetchChefDetails();
  }, []);
  
  const fetchChefDetails = async () => {
    try {
      const res1 = await axiosInstance.get(`/users/user/${id}`,{
        withCredentials: true
      });
      setChef(res1.data);
      const res2 = await axiosInstance.get(`/foodItems/get/${id}`,{
        withCredentials: true 
      });
      setFoodItems(res2.data);
    } catch (err) {
      console.error('Error fetching chef details', err);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const submitOrder = async () => {
    const orderdata = { chefId: id, total, items: cart };
    console.log(orderdata);
  
    try {
      const res = await axiosInstance.post('/orders/add', orderdata, {
        withCredentials: true, 
      });
  
      setCart([]);
      toast.success('✅ Order placed successfully!');
      setShowCart(false);
      console.log(res);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

          const retryRes = await axiosInstance.post('/orders/add', orderdata, {
            withCredentials: true,
          });
  
          setCart([]);
          toast.success('✅ Order placed successfully!');
          setShowCart(false);
       } catch (refreshError) {
          console.error('Token refresh failed or retry failed:', refreshError);
        }
      } else {
        console.error('Order submit error:', err);
      }
    }
  };
  
  const followChef= async()=>{
    try {
      const res = await axiosInstance.post(`/users/follow/${id}`,{},{
      withCredentials: true 
    });  
  } catch (err) {
    if (err.response?.status === 403) {
      try {
        const res =await axiosInstance.post('/refresh-token', {}, { withCredentials: true });
        const retryRes = await axiosInstance.post(`/users/follow/${id}`,{},{
          withCredentials: true 
        });
      } catch (refreshError) {
        console.error('Token refresh failed or retry failed:', refreshError);
      }
    } else {
      console.error('follow chef error:', err.response);
    }
  }
};

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

   total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="chef-page-container">
      {/* Top right cart icon */}
      {user &&(<div className={`cart-icon ${cart.length > 0 ? 'has-items' : ''}`} onClick={() => setShowCart(true)}>
        🛒
      </div>)}

      {/* Chef Info */}
      {chef && (
        <div className="chef-info">
          {chef.image_url && <img src={
                      chef?.image_url
                ? `${process.env.REACT_APP_API_URL}${chef.image_url}`
                : '/default-profile.png'} alt="Chef" className="chef-image" />}
          <h2>{chef.name}</h2>
          <p className="chef-bio">{chef.bio}</p>

          {user &&<button onClick={() => followChef()}>follow</button>}
          {user && <button onClick={() => navigate(`/messages/${id}/${name}`)} >message</button>}

        </div>
      )}

      {/* Food Items */}
  
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
              {user &&(<button style={{width: '32px',height: '32px',backgroundColor: '#f0c14b',borderRadius: '50%',color: '#333',}}
               onClick={()=>addToCart(item)}>+</button>)}
            </div>
          ))}
        </div>
      </div>
    ) : null;
  })}
</div>


      {/* Cart Popup */}
      {user && showCart && (
  <div className="cart-popup">
    <h3>Cart</h3>

    {cart.length === 0 ? (
      <p>Cart is empty</p>
    ) : (
      <>
        <ul>
          {cart.map((item) => (
           <li key={item.id} className="cart-item">
           <div className="food-item-details">
             {item.image_url && (
               <img
                 src={item?.image_url ? `${process.env.REACT_APP_API_URL}${item.image_url}` : '/default-profile.png'}
                 alt={item.name}
                 className="food-img"
               />
             )}
             <span>{item.name}</span>
           </div>
           <input
             type="number"
             value={item.quantity}
             onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
             min="1"
           />
           <button onClick={() => removeFromCart(item.id)}>Remove</button>
         </li>
         
          ))}
        </ul>

        <p>Total: ${total.toFixed(2)}</p>

        <button onClick={() => submitOrder()}className="order-button">
          Order
        </button>
      </>
    )}

    <button onClick={() => setShowCart(false)} className="close-button">
      x
    </button>
  </div>
)}

    </div>
  );
}
