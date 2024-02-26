import React, { useState,useEffect } from 'react'
import ModalChooseImg from '../element/ModalChooseImg';
import "./SearchPage.css"
import data from '../data.json'
import img from "../img/testimg.jpeg"
const users = data.User
function SearchPage() {
  // const [file, setFile] = useState(null);
  // const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalChooseImg , setIsModalChooseImg] = useState(false)
  const openModalChooseImg =()=> setIsModalChooseImg(true)
  const closeModalChooseImg =()=> setIsModalChooseImg(false)

  // useEffect(() => {
  //   if (!file) {
  //     setPreviewUrl(null);
  //     return;
  //   }
  //   const objectUrl = URL.createObjectURL(file);
  //   setPreviewUrl(objectUrl);

  //   return () => URL.revokeObjectURL(objectUrl);
  // }, [file]);

  // function handleFileChange(event) {
  //   const file = event.target.files[0];
  //   if (!file) {
  //     return;
  //   }
  //   setFile(file);
  // }

  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
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
            {/* <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg"/>
            {previewUrl && <img src={previewUrl} alt="Preview" style={{width: '100px', height: '100px'}} />} */}
          </div>
        </div>
      </div>
      <div className="filter-wrap-search">
        <div className="filter-search">
          <form>
            <select>
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
            <div className="th profile">face</div>
            <div className="th name">ชื่อ-นามสกุล</div>
            <div className="th gender">เพศ</div>
            <div className="th age">อายุ</div>
            <div className="th age">อารมณ์</div>
            <div className="th edit">วันที่</div>
            <div className="th delete">เวลา</div>
            <div className="th delete">BG</div>
          </div>
        </div>
        <div className="table-body">
          {users.map(user => (
            <div className='tr' key={user.UserID}>
              <div className="td profile" ><img src={img} style={{width:"40px",height:"40px"}}/></div>
              <div className="td name">{user.Name}</div>
              <div className="td gender">{user.Gender}</div>
              <div className="td age">{user.Age}</div>
              <div className="th age">อารมณ์</div>
              <div className="th age">วันที่</div>
              <div className="th age">เวลา</div>
              <div className="td delete">
                <button className="delete-user" >BG</button>
              </div>
            </div>
          ))}
        </div>
      </div>


      {isModalChooseImg && (
        <ModalChooseImg onclose={closeModalChooseImg}/>
      )}
    </div>
  )
}

export default SearchPage