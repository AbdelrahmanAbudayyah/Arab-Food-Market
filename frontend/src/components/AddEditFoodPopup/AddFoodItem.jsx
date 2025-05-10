import React from 'react';
import './addEditModal.css';

const AddFoodModal = ({ show, closeModal, handleAddFoodItem, foodItem, handleChange }) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddFoodItem();
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal" onClick={closeModal}>×</button>
        <h3>Add New Food Item</h3>
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
            step="1"
            min="1"
            required
          />

          <label>Category</label>
          <select name="category" value={foodItem.category} onChange={handleChange} required>
            <option value="main">Main</option>
            <option value="side">Side</option>
            <option value="dessert">Dessert</option>
          </select>

          <label>Image</label>
          <input
            name="image_url"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />

          <button type="submit" className="submit-btn">Add Item</button>
        </form>
      </div>
    </div>
  );
};

export default AddFoodModal;
