import React, { useState, useEffect } from 'react'
import ModalChooseImg from '../element/ModalChooseImg';
import "./SearchPage.css"
import data from '../data.json'
import img from "../img/testimg.jpeg"
import ModalBgImage from '../element/ModalBgImage';

const users = data.User

function SearchPage() {
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isModalChooseImg, setIsModalChooseImg] = useState(false)
  const openModalChooseImg = () => setIsModalChooseImg(true)
  const closeModalChooseImg = () => setIsModalChooseImg(false)
  const [isModalBGImg, setIsModalBGImg] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };
  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    console.log(filterValue);
    setSelectedFilter(filterValue);
  };

  return (
    <div className='search'>
      <div className="head-search-wrap">
        <div className="head-search-info">Search&History</div>
        <div className="head-search-end">
          <div className="head-search-fromname">
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
          <div className="head-search-fromimg">
            <button onClick={openModalChooseImg}>search from img</button>
          </div>
        </div>
      </div>
      <div className="filter-wrap-search">
        <div className="filter-search">
          <form>
            <select onChange={handleFilterChange}>
              <option >-</option>
              <option value="daily">daily</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </form>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-head">
          <div className="tr">
            <div className="th idDetect">number</div>
            <div className="th name">ชื่อ-นามสกุล</div>
            <div className="th gender">เพศ</div>
            <div className="th age">อายุ</div>
            <div className="th feel">อารมณ์</div>
            <div className="th date">วันที่</div>
            <div className="th time">เวลา</div>
            <div className="th faceimg">Face</div>
            <div className="th bgimg">BG</div>
          </div>
        </div>
        <div className="table-body">
          {users.map(user => (
            <div className='tr' key={user.UserID}>
              <div className="td idDetect" >1</div>
              <div className="td name">{user.Name}</div>
              <div className="td gender">{user.Gender}</div>
              <div className="td age">{user.Age}</div>
              <div className="th feel">อารมณ์</div>
              <div className="th date">วันที่</div>
              <div className="th time">เวลา</div>
              <div className="td faceimg"><img src={img} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></div>
              <div className="td bgimg">
                <button onClick={() => setIsModalBGImg(true)}><img src={img} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalBGImg && (
        <ModalBgImage onclose={() => setIsModalBGImg(false)} />
      )}
      {isModalChooseImg && (
        <ModalChooseImg onclose={closeModalChooseImg} />
      )}
    </div>
  )
}

export default SearchPage