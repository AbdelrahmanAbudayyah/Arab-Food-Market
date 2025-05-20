import React from 'react';
import './addEditModal.css';

const EditFoodModal = ({ show, closeModal, handleUpdateFoodItem, foodItem, handleChange }) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateFoodItem(foodItem);
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal" onClick={closeModal}>×</button>
        <h3>Edit Food Item</h3>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={foodItem.name}
            required
          />

          <label>Description</label>
          <input
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={foodItem.description}
            required
          ></input>

          <label>Price ($)</label>
          <input
            name="price"
            type="number"
            placeholder="Price"
            onChange={handleChange}
            value={foodItem.price}
            step="0.01"
            min="0"
            required
          />

          <label>Category</label>
          <select name="category" value={foodItem.category} onChange={handleChange} required>
            <option value="main">Main</option>
            <option value="side">Side</option>
            <option value="dessert">Dessert</option>
          </select>

          
          <label>Current Image</label>
          <img
                  src={
                    foodItem.image_url && typeof foodItem.image_url === 'object'
                      ? URL.createObjectURL(foodItem.image_url)
                      : foodItem.image_url
                        ? `${process.env.REACT_APP_API_URL}${foodItem.image_url}`
                        : '/default-placeholder.png'
                  }
                  alt="Food preview"
                  className="food-img"
                />

          <label>Upload New Image</label>
          <input
            name="image_url"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />

          <button type="submit" className="small-button">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditFoodModal;
