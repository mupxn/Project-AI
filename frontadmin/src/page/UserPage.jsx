import React from 'react'
import { useState } from 'react';
import './UserPage.css'
import data from '../data.json'
import ModalDeleteUser from '../element/ModalDeleteUser';
import ModalAddUser from '../element/ModalAddUser';
const users = data.User

function UserPage() {
  //modal add user
  const [isModalAddUser, setIsModalAddUser] = useState(false);
  //modal delete
  const [isModalDeleteUser, setIsModalDeleteUser] = useState(false)
  //edit state
  const [isEditUser, setIsEditUser] = useState(false)

  const openModalEditUser = () => setIsEditUser(true)
  const clostModalEditUser = () => setIsEditUser(false)

  const openModalDelelteUser = () => setIsModalDeleteUser(true);
  const closeModalDelelteUser = () => setIsModalDeleteUser(false);

  const openModalAddUser = () => setIsModalAddUser(true);
  const closeModalAddUser = () => setIsModalAddUser(false);

  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle the search action (e.g., when the user submits the form)
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    console.log('Searching for:', searchQuery); // For demonstration, you might make an API call here
  };

  return (
    <div className='user'>
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
            <button type="button" className="btn-add-user" onClick={openModalAddUser}>Add User</button>
          </div>
        </div>

      </div>

      <div className="table-wrap">
        <div className="table-head">
          <div className="tr">
            <div className="th id">ID</div>
            <div className="th name">ชื่อ-นามสกุล</div>
            <div className="th gender">เพศ</div>
            <div className="th age">อายุ</div>
            <div className="th edit">แก้ไข</div>
            <div className="th delete">ลบ</div>
          </div>
        </div>
        <div className="table-body">
          {users.map(user => (
            <div className='tr' key={user.UserID}>
              <div className="td id">{user.UserID}</div>
              <div className="td name">{user.Name}</div>
              <div className="td gender">{user.Gender}</div>
              <div className="td age">{user.Age}</div>
              <div className="td edit">
                <button className="edit-user" onClick={openModalEditUser}>แก้ไข</button>
              </div>
              <div className="td delete">
                <button className="delete-user" onClick={openModalDelelteUser}>ลบ</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      jgvthfhdfhdfutdfjftutfjtfjt
      {isModalDeleteUser && (
        <ModalDeleteUser isOpen={isModalDeleteUser} onClose={closeModalDelelteUser}/>
      )}

      <ModalAddUser isOpen={isModalAddUser} onClose={closeModalAddUser}>
        <h2>Add New User</h2>
        {/* Form fields for adding a user can be placed here */}
      </ModalAddUser>
    </div >
  )
}

export default UserPage