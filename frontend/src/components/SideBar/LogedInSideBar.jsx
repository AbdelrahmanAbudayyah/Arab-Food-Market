import './sideBar.css';
import { useRef, useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from'../../axiosInstance';


export default function LoggedInSideBar({ sidebarOpen, setSidebarOpen }) {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const { user,logout} = useAuth(); // ✅ Get logout from context

 
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  const logOut= async ()=>{
    try{
       await axiosInstance.post('/logout', {}, { withCredentials: true });
       logout()
  }catch (err) {
        console.error('logout error:', err);
    }
  } 

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar after navigation
  };

  return (
    <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <ul className="sidebar-menu">
        <li onClick={() => handleNavigation('/home')}>Home</li>
        <li onClick={() => handleNavigation('/profile')}>Profile</li>
        <li onClick={() => handleNavigation('/orders')}>My Orders</li>
        <li onClick={() => handleNavigation('/messages')}>Messages</li>
        <li onClick={() => {
                              logOut();
                              setSidebarOpen(false);
                            }}>Logout</li>
      </ul>
    </div>
  );
}
