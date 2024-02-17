import React from 'react'
import { useState } from 'react';
import './UserPage.css'
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

function UserPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  // State to hold the search query
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle the change in the input field
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Function to handle the search action (e.g., when the user submits the form)
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    console.log('Searching for:', searchQuery); // For demonstration, you might make an API call here
  };

  return (
    <div className='head-wrap'>
      <div className='head-info'>
        Infomation User
      </div>
      <div className="head-end">
        <div className="head-search">
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={handleSearchChange}
            />
            <button type="submit">Search</button>
          </form>
        </div>
        <div className="head-adduser">
          <button type="button" className="btn-add-user" onClick={openModal}>Add User</button>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Add New User</h2>
        {/* Form fields for adding a user can be placed here */}
      </Modal>
    </div>
  )
}

export default UserPage