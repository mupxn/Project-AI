import React, { useState, useEffect } from 'react'
import ModalChooseImg from '../element/ModalChooseImg';
import "./SearchPage.css"
import data from '../data.json'
import img from "../img/testimg.jpeg"
import ModalBgImage from '../element/ModalBgImage';
import axios from "axios";
const users = data.User

function SearchPage() {
  const [detection,setDetection] = useState([])
  const [maxDate, setMaxDate] = useState('');
  const [maxMonth, setMaxMonth] = useState('');
  const [isModalChooseImg, setIsModalChooseImg] = useState(false)
  const [isModalBGImg, setIsModalBGImg] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('')
  const [selectDetect, setSelectDetect] = useState('')
  const handleBGImage=(ID)=>{
    setIsModalBGImg(true)
    setSelectDetect(ID)
  }
  const openModalChooseImg = () => setIsModalChooseImg(true)
  const closeModalChooseImg = () => setIsModalChooseImg(false)
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };
  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    setSelectedFilter(filterValue)
  }

  useEffect(() => {
    const today = new Date()
    const maxDateValue = today.toISOString().split('T')[0];
    const maxMonthValue = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    setMaxMonth(maxMonthValue);
    setMaxDate(maxDateValue);
  }, []);
  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:5000/api/detect')
        .then(response => {
          setDetection(response.data);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    };
    fetchData();
  },[])
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
              {/* <button type="submit">Search</button> */}
            </form>
          </div>
          <div className="head-search-fromimg">
            <button onClick={openModalChooseImg}>search from img</button>
          </div>
        </div>
      </div>
      <div className="filter-wrap-search">
        <div className="filter-search">
          <div className="filter">
            <select onChange={handleFilterChange}>
              <option >-</option>
              <option value="daily">daily</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </div>
          <div className='show-filter'>
            {selectedFilter === 'daily' &&
              <>
                <form>
                  <input type='date' max={maxDate}></input>
                </form>
              </>
            }
            {selectedFilter === 'monthly' &&
              <>
                <form>
                  <input type='month' max={maxMonth}></input>
                </form>
              </>

            }
            {selectedFilter === 'yearly' &&
              <>
                <form>
                  <select>
                    <option >2019</option>
                    <option >2020</option>
                    <option >2021</option>
                    <option >2022</option>
                    <option >2023</option>
                    <option value="2024">2024</option>
                  </select>
                </form>
              </>
            }
          </div>
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
          {detection.map(item => (
            <div className='tr' key={item.DetectID}>
              <div className="td idDetect">{item.ID}</div>
              <div className="td name">{item.Name}</div>
              <div className="td gender">{item.Gender}</div>
              <div className="td age">{item.Age}</div>
              <div className="th feel">{item.EmoName}</div>
              <div className="th date">{item.Date}</div>
              <div className="th time">{item.Time}</div>
              <div className="td faceimg"><img src={`data:image/jpeg;base64,${item.FaceDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></div>
              <div className="td bgimg">
                <button onClick={() => handleBGImage(item.ID)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalBGImg && (
        <ModalBgImage onclose={() => setIsModalBGImg(false)} DetectID={selectDetect} />
      )}
      {isModalChooseImg && (
        <ModalChooseImg onclose={closeModalChooseImg} />
      )}
    </div>
  )
}

export default SearchPage