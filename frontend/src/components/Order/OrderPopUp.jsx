import './orderPopup.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';



export default function OrderPopup({ show, closeModal, order, handleStatus }) {
  const { user } = useAuth();
  const navigate = useNavigate();


  if (!show || !order) return null;
  const foodItems = order.items;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={closeModal}>X</button>
        
        <h2>Order #{order.id}</h2>
        {user.type === 'chef' ? (
           <p className="customer-line">
           <strong>Customer:</strong> {order.customer_name}
           <button
             className="icon-btn"
             onClick={() => navigate(`/messages/${order.customer_id}`)}
             title="Message Customer"
           >
             <FiMessageSquare />
           </button>
         </p>

        ) : (
          <p onClick={() => navigate(`/chef/${order.chef_id}`)}><strong>Chef:</strong> {order.chef_name}</p>
        )}

        {foodItems.map((foodItem,index) => (
          <div key={index} className="food-item">
            <p>
              <span className="item"><strong>Item:</strong> {foodItem.name}</span>
              <span className="price"><strong>Price:</strong> ${foodItem.price}</span>
              <span className="quantity"><strong>Quantity:</strong> {foodItem.quantity}</span>
            </p>
          </div>
        ))}
        
        <p><strong>Placed:</strong> {new Date(order.date).toLocaleDateString()}</p>
        <p><strong>Total:</strong> ${order.total}</p>
        <p><strong>Status:</strong> {order.status}</p>

        {user.type === 'chef' && (
              <>
                {order.status !== 'canceled' && (
                  <>
                    <button onClick={() => handleStatus("confirmed", order.id)} disabled={order.status === 'confirmed'} >Confirm</button>
                    <button onClick={() => handleStatus("canceled", order.id)}>Decline</button>
                  </>
                )}
              </>
            )}

      </div>
    </div>
  );
}
