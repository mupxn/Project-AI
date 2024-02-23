import React, { Children, useEffect } from 'react'
import { useState } from 'react';
import './UserPage.css'
import data from '../data.json'
import ModalDeleteUser from '../element/ModalDeleteUser';
import ModalAddUser from '../element/ModalAddUser';
import ModalEditUser from '../element/ModalEditUser';
import img from "../img/testimg.jpeg"
const users = data.User
const itemsPerPage = 5;
// pagination / edit image /crop image
function UserPage() {
  const [selected,setSelected] = useState(null)
  //modal add user
  const [isModalAddUser, setIsModalAddUser] = useState(false);
  //modal delete
  const [isModalDeleteUser, setIsModalDeleteUser] = useState(false)
  //edit state
  const [isModalEditUser, setIsModalEditUser] = useState(false)

  const openModalEditUser = (userID) => {
    setIsModalEditUser(true)
    setSelected(userID)
  }
  const closeModalEditUser = () => setIsModalEditUser(false)

  const openModalDelelteUser = (userID) => {
    setIsModalDeleteUser(true);
    setSelected(userID)
  }
  const closeModalDelelteUser = () => setIsModalDeleteUser(false);

  const openModalAddUser = () => setIsModalAddUser(true);
  const closeModalAddUser = () => setIsModalAddUser(false);

  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const [ posts,setPosts ] = useState([])
  const [ loading,setLoading ] = useState(false)
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ postsPerPage, setPostsPerPage ] = useState(10)
  
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
            <div className="th profile">profile</div>
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
              <div className="td profile" ><img src={img} style={{width:"40px",height:"40px"}}/></div>
              <div className="td name">{user.Name}</div>
              <div className="td gender">{user.Gender}</div>
              <div className="td age">{user.Age}</div>
              <div className="td edit">
                <button className="edit-user" onClick={() => openModalEditUser(user.UserID)}>แก้ไข</button>
              </div>
              <div className="td delete">
                <button className="delete-user" onClick={() => openModalDelelteUser(user.UserID)}>ลบ</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalDeleteUser && (
        <ModalDeleteUser onClose={closeModalDelelteUser} userId={selected}/>
      )}

      {isModalAddUser && (
        <ModalAddUser onClose={closeModalAddUser}/>
      )}

      {isModalEditUser && (
        <ModalEditUser onClose={closeModalEditUser} userId={selected}/>
      )}
    </div >
  )
}

export default UserPage