import React, { useState } from 'react';
import './css/becomeAChefModal.css';
import { IoClose } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext'; // Make sure the path is correct
import axiosInstance from'../../axiosInstance';

export default function BecomeAChefModal({ isOpen, onClose }) {
  const additionalData={}; 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    state: '',
    city: '',
    type: 'chef',
    additionalData:{
      bio:''
    }
   
  });

  const [imageFile, setImageFile] = useState(null);
  const { login } = useAuth(); // Get login function from context

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bio') {
      setFormData((prev) => ({
        ...prev,
        additionalData: {
          ...prev.additionalData,
          bio: value,
        },
      }));
    } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'additionalData') {
        data.append(key, JSON.stringify(value)); // serialize the object
      }else{
      data.append(key, value);
      }
    });

    if (imageFile) {
      data.append('image_url', imageFile); // Adjust key if your backend expects a different name
    }

    try {
      console.log(data);
      const res = await axiosInstance.post('/users/signup', data,{
        withCredentials: true // so cookies get sent/stored
      });
      const { token, user } = res.data; // Assuming backend sends both

      // Save user data (or just token, up to you)
      login({ token, ...user });
      console.log('User signed up:', res.data);
      onClose(); // close modal on success
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
        <form className="become-chef-form" onSubmit={handleSubmit}>
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
          <input
            type="text"
            name="bio"
            placeholder="Bio"
            required
            onChange={handleChange}
          />
          {/* Image upload with label */}
            <div className="image-upload">
                <label htmlFor="profile-pic">Profile Picture</label>
                <input 
                name="image_url"
                id="profile-pic" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                />
            </div>
            <input type="hidden" name="type" value="chef" />

          <button type="submit">Become a chef</button>
        </form>
      </div>
    </div>
  );
}
