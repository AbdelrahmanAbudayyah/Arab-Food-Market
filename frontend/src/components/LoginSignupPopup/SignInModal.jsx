import React, { useState } from 'react';
import './css/signInModal.css';
import { IoClose } from 'react-icons/io5';
//import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // Make sure the path is correct
import axiosInstance from'../../axiosInstance';

export default function SignInModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useAuth(); // Get login function from context
  const [errorMessage, setErrorMessage] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors
    try {
      const res = await axiosInstance.post('/users/login', formData,{
        withCredentials: true // so cookies get sent/stored
      });
      //const { token, user } = res.data; // Assuming backend sends both
      const {user } = res.data; // Assuming backend sends both

      console.log(user);

      // Save user data (or just token, up to you)
      //login({ token, ...user });
      login({...user });

      onClose(); // Close modal
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      console.error('Login error:',msg);
      setErrorMessage(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <IoClose size={24} />
        </button>
        <h2 className='signIn'>Sign In</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form className="sign-in-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}
