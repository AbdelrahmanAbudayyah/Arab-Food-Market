import React, { useState } from 'react';
import './css/signUpModal.css';
import { IoClose } from 'react-icons/io5';
import axiosInstance from'../../axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUpModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    state: '',
    city: '',
    type: 'customer',
  });

  const [imageFile, setImageFile] = useState(null);
  const { login } = useAuth(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (imageFile) {
      data.append('image_url', imageFile); 
    }

    try {
      const res = await axiosInstance.post('/users/signup', data,{
        withCredentials: true 
      });
      const {  user } = res.data;
      login({  ...user });
      onClose(); 
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <IoClose size={24} />
        </button>
        <h2>Sign Up</h2>
        <form className="sign-up-form" onSubmit={handleSubmit}>
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
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            onChange={handleChange}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            required
            onChange={handleChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            required
            onChange={handleChange}
          />
          {/* Image upload with label */}
            <div className="image-upload">
                <label htmlFor="profile-pic">Profile Picture</label>
                <input 
                id="profile-pic" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                />
            </div>
            <input type="hidden" name="type" value="customer" />

          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
