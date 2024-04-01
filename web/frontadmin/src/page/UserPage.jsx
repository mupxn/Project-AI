import React, { useEffect } from 'react'
import { useState } from 'react';
import './UserPage.css'
import ModalDeleteUser from '../element/ModalDeleteUser';
import ModalAddUser from '../element/ModalAddUser';
import ModalEditUser from '../element/ModalEditUser';
import EditIcon from '../icon/EditIcon'
import DeleteIcon from '../icon/DeleteIcon';
import axios from 'axios';
import AdduserIcon from '../icon/AdduserIcon';
import Addimageicon from '../icon/Addimageicon';
import ModalAddImage from '../element/ModalAddImage';

function UserPage() {
  const [users, setUsers] = useState([]) //map user from database
  const [selected, setSelected] = useState(null) //set userID when click button
  const [selectedName, setSelectedName] = useState(null) //set Name when click button  
  const [isModalAddUser, setIsModalAddUser] = useState(false); //modal add user
  const [isModalDeleteUser, setIsModalDeleteUser] = useState(false) //modal delete
  const [isModalEditUser, setIsModalEditUser] = useState(false) //modal edit
  const [isModalAddImage, setIsModalAddImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // add image
  const openModalAddImage = (userID, userName) => {
    setIsModalAddImage(true)
    setSelected(userID)
    setSelectedName(userName)
  }
  const closeModalAddImage = () => setIsModalAddImage(false)
  //edit
  const openModalEditUser = (userID, userName) => {
    setIsModalEditUser(true)
    setSelected(userID)
    setSelectedName(userName)
  }
  const closeModalEditUser = () => setIsModalEditUser(false)
  //delete
  const openModalDelelteUser = (userID, userName) => {
    setIsModalDeleteUser(true);
    setSelected(userID)
    setSelectedName(userName)
  }
  const closeModalDelelteUser = () => setIsModalDeleteUser(false);
  //add
  const openModalAddUser = () => setIsModalAddUser(true);
  const closeModalAddUser = () => setIsModalAddUser(false);
  //search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);

  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    fetchData()
  };

  const fetchData = async () => {
    try {
      if (searchQuery === '') {
        const response = await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/user`);
        setUsers(response.data);
      } else {
        const response = await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/user/${searchQuery}`);
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserAction = () => {
    fetchData();
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
              {/* <button type="submit">Search</button> */}
            </form>
          </div>
          <div className="head-adduser">
            <button type="button" className="btn-add-user" onClick={openModalAddUser}>
              <div className="wrap">
                <div className="icon-wrap"><AdduserIcon /></div>
                <div className="text-add">Add User</div>
              </div>
            </button>
          </div>
        </div>

      </div>

      <div className="table-wrap">
        <div className="table-head">
          <div className="tr">
            <div className="th profile">profile</div>
            <div className="th name">ชื่อ-นามสกุล</div>
            <div className="th edit">เพิ่มรูป</div>
            <div className="th edit">แก้ไข</div>
            <div className="th delete">ลบ</div>
          </div>
        </div>
        <div className="table-body">
          {users.map(user => (
            <div className='tr' key={user.UserID}>
              <div className="td profile"><img src={`${process.env.REACT_APP_KIOSK_PORT}/user_images/${user.ID}/photo${user.ID}.jpg`} style={{ width: "40px", height: "40px" }} /></div>
              <div className="td name">{user.Name}</div>
              <div className="td addimage">
                <button className="addimage-user" onClick={() => openModalAddImage(user.ID, user.Name)}><Addimageicon /></button>
              </div>
              <div className="td edit">
                <button className="edit-user" onClick={() => openModalEditUser(user.ID, user.Name)}><EditIcon /></button>
              </div>
              <div className="td delete">
                <button className="delete-user" onClick={() => openModalDelelteUser(user.ID, user.Name)}><DeleteIcon /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalDeleteUser && (
        <ModalDeleteUser onClose={closeModalDelelteUser} userId={selected} userName={selectedName} action={handleUserAction} />
      )}

      {isModalAddUser && (
        <ModalAddUser onClose={closeModalAddUser} action={handleUserAction} />
      )}

      {isModalEditUser && (
        <ModalEditUser onClose={closeModalEditUser} userId={selected} userName={selectedName} action={handleUserAction} />
      )}

      {isModalAddImage && (
        <ModalAddImage onClose={closeModalAddImage} userId={selected} action={handleUserAction} />
      )}
    </div >
  )
}

export default UserPage