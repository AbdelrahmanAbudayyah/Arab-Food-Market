import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';


import axiosInstance from'../axiosInstance';
import './css/ordersPage.css';
import OrderPopup from '../components/Order/OrderPopUp'; 



export default function OrdersPage(){
    const {user} = useAuth();
    const [orders,setOrders]= useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderPopupVisible,setIsOrderPopupVisible] = useState(false);
    const [fullOrder, setFullOrder]=useState(null);


    useEffect(()=>{
        if (user) {
            GetOrders();
            {console.log(orders)}

        }
    },[user]);



    const GetOrders = async ()=>{
        try{
        let res;
        if (user.type==='chef'){
         res= await axiosInstance.get('/orders/get/chef',{
            withCredentials: true,
        });
    }
        else {
         res= await axiosInstance.get('/orders/get/customer');
        }
        console.log(res.data);
        setOrders(res.data);

    }catch (err) {
        if (err.response?.status === 401) {
          try {
            await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

            let res;
        if (user.type==='chef'){
         res= await axiosInstance.get('/orders/get/chef',{
            withCredentials: true,
        });
        }
        else {
         res= await axiosInstance.get('/orders/get/customer');
        }
        setOrders(res.data);

          } catch (refreshError) {
            console.error('Token refresh failed or retry failed:', refreshError);
            // Optionally: log out user or redirect to login
          }
        } else {
          console.error('get orders error:', err);
        }
      }
    };

    const handleStatus=  async(status,orderId)=>{
        try{
            const res = await axiosInstance.put(`/orders/put/${orderId}`,{status},{
                withCredentials:true,
            })
            const updatedStatus = res.data.status;

            setFullOrder(prev => ({
              ...prev,
              status: updatedStatus,
            }));
        
            setOrders(prev =>
              prev.map(order =>
                order.id === orderId
                  ? { ...order, status: updatedStatus }
                  : order
              )
            );

        }catch (err) {
            if (err.response?.status === 401) {
              try {
                await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

                const res = await axiosInstance.put(`/orders/put/${orderId}`,{status},{
                    withCredentials:true,
                })
                const updatedStatus = res.data.status;

    setSelectedOrder(prev => ({
      ...prev,
      status: updatedStatus,
    }));

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: updatedStatus }
          : order
      )
    );
              } catch (refreshError) {
                console.error('Token refresh failed or retry failed:', refreshError);
              }
            } else {
              console.error('update status error:', err);
            }
          }
        };

    const getFullOrder= async(orderId)=>{

        try{
            const res = await axiosInstance.get(`/orders/get/${orderId}`,{},{
                withCredentials:true,
            })
            setFullOrder(res.data);
          

        }catch (err) {
            if (err.response?.status === 401) {
              try {
                await axiosInstance.post('/refresh-token', {}, { withCredentials: true });

                const res = await axiosInstance.get(`/orders/get/${orderId}`,{},{
                    withCredentials:true,
                })
                setFullOrder(res.data);
            

  
              } catch (refreshError) {
                console.error('Token refresh failed or retry failed:', refreshError);
              }
            } else {
              console.error('get full order error:', err);
            }
          }

    }    


    return (
      <>
        <div className="orders_user">
          <div className="orders">
            <h1>Your Orders</h1>
            {orders.map((order) => (
              <div
              
                key={order.order_id}
                className="order-card"
                onClick={() => {
                  getFullOrder(order.order_id);
                  setIsOrderPopupVisible(true);
                }}
              >
                <div className="order-detail">
                  <strong>Order ID:</strong> <p>{order.order_id}</p>
                </div>
                <div className="order-detail">
                  {user.type === 'chef' ? (
                    <>
                      <strong>Customer:</strong> <p>{order.name}</p>
                    </>
                  ) : (
                    <>
                      <strong>Chef:</strong> <p>{order.name}</p>
                    </>
                  )}
                </div>
                <div className="order-detail">
                  <strong>Total:</strong> <p>${order.total}</p>
                </div>
                <div className="order-detail">
                  <strong>Status:</strong> <p>{order.status}</p>
                </div>
                <div className="order-detail">
                <p><strong>Placed:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          <OrderPopup
          show={isOrderPopupVisible}
          closeModal={() => setIsOrderPopupVisible(false)}
          order={fullOrder}
          handleStatus={handleStatus}
        />
      


        </div>
      </>
    );
    


   
    
        
   
    
}