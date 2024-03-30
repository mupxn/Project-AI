import React, { useState, useEffect } from 'react'
import ModalChooseImg from '../element/ModalChooseImg';
import "./SearchPage.css"
import ModalBgImage from '../element/ModalBgImage';
import axios from "axios";

function SearchPage() {
  const [hasClick, setHasClick] = useState(false)
  const [detection, setDetection] = useState([])
  //filter
  const [filterDateDetection, setFilterDateDetection] = useState([])
  const [filterMonthDetection, setFilterMonthDetection] = useState([])
  const [filterYearDetection, setFilterYearDetection] = useState([])
  //search
  const [filterDateDetectionSearch, setFilterDateDetectionSearch] = useState([])
  const [filterMonthDetectionSearch, setFilterMonthDetectionSearch] = useState([])
  const [filterYearDetectionSearch, setFilterYearDetectionSearch] = useState([])
  const [maxDate, setMaxDate] = useState('');
  const [maxMonth, setMaxMonth] = useState('');
  const [isModalChooseImg, setIsModalChooseImg] = useState(false)
  const [isModalBGImg, setIsModalBGImg] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('') // filter value click
  const [selectDetect, setSelectDetect] = useState('') //BG
  const [date, setDate] = useState('')
  const [apiError, setApiError] = useState('');
  const [fetchMonth, setFetchMonth] = useState(false);
  const [fetchYear, setFetchYear] = useState(false);
  const [statusSearchPho, setStatusSearchPho] = useState(false);
  const [imageData, setImageData] = useState(null);
  const handleBGImage = (BG) => {
    setIsModalBGImg(true)
    setSelectDetect(BG)
  }
  const openModalChooseImg = () => setIsModalChooseImg(true)
  const closeModalChooseImg = () => setIsModalChooseImg(false)

  const searchPhoto = () => {
    setHasClick(false);
    setStatusSearchPho(true);
    console.log('test 1')
  };

  const handleImageData = (data) => {
    console.log('test 1')
    setImageData(data);
    console.log('Received image data:', data);
};


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    console.log(searchQuery)
    fetchData();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    fetchData();
  };
  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    setStatusSearchPho(false)
    if (filterValue != '-') {
      setSelectedFilter(filterValue)
      setHasClick(true)
      console.log(hasClick);
      console.log(e.target.value);
    }
    else if (filterValue == '-') {
      setSelectedFilter('')
      setHasClick(false)
      console.log(hasClick);
    }
  }

  const handleFilter = (e) => {
    let updatedFilter = e.target.value;
    setDate(updatedFilter)
    fetchData(updatedFilter);
  }



  useEffect(() => {
    const today = new Date()
    const maxDateValue = today.toISOString().split('T')[0];
    const maxMonthValue = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    setMaxMonth(maxMonthValue);
    setMaxDate(maxDateValue);
    fetchData();
    // const interval = setInterval(fetchData, 2000); 
    // return () => clearInterval(interval); 
  }, []);
  const fetchData = async (updatedFilter) => {
    if (hasClick == false && statusSearchPho == false) {
      if(searchQuery === ""){
        await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/detect`)
        .then(response => {
          setDetection(response.data);
          setApiError("null")
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setApiError('No Data');
        });
      }else{
        await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/detect/${searchQuery}`)
        .then(response => {
          console.log('first', response.data)
          setDetection(response.data);
          setApiError("null")
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setApiError('No Data');
        });
      }
      
    }
    else if (hasClick == true && selectedFilter === 'daily') {
        if(searchQuery === ""){
          await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/detect/filter/date/${updatedFilter}`)
        .then(response => {
          setFilterDateDetection(response.data)
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
        }else if(searchQuery !== ""){
          await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/detect/filter/date/${date}/${searchQuery}`)
        .then(response => {
          setFilterDateDetectionSearch(response.data)
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
        }

    }
    else if (hasClick == true && selectedFilter === 'monthly') {
      if(searchQuery === ""){
        await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/detect/filter/month/${updatedFilter}`)
      .then(response => {
        if(fetchMonth === false){
          setFilterMonthDetection(response.data)
          console.log(response.data)
          setFetchMonth(true)
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setApiError('No Data');
      });
      }else if(searchQuery !== ""){
        await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/detect/filter/month/${date}/${searchQuery}`)
      .then(response => {
        setFilterMonthDetectionSearch(response.data)
        setApiError("null")
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setApiError('No Data');
      });
      }
    }
    else if (hasClick == true && selectedFilter === 'yearly') {
        if(searchQuery === ""){
          if(fetchYear===false){
            await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/detect/filter/year/${updatedFilter}`)
        .then(response => {
          setFilterYearDetection(response.data)
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setApiError('No Data');
        });
        setFetchYear(true)
          }
          
        }else if(searchQuery !== ""){
          await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/detect/filter/year/${date}/${searchQuery}`)
        .then(response => {
          setFilterYearDetectionSearch(response.data)
          setApiError("null")
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setApiError('No Data');
        });
        }
    }
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
              <option value="-">-</option>
              <option value="daily">daily</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </div>
          <div className='show-filter'>
            

            {selectedFilter === 'daily' &&
              <>
                <form>
                  <input type='date' max={maxDate} onChange={handleFilter}></input>
                </form>
              </>
            }
            {selectedFilter === 'monthly' &&
              <>
                <form>
                  <input type='month' max={maxMonth} onChange={handleFilter}></input>
                </form>
              </>

            }
            {selectedFilter === 'yearly' &&
              <>
                <form>
                  <select onChange={handleFilter}>
                    <option >-</option>
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
        {hasClick === false && statusSearchPho === false&&
            <>
              {detection.map(item => (
                <div className='tr' key={item.DetectID}>
                  <div className="td idDetect">{item.ID}</div>
                  <div className="td name">{item.Name}</div>
                  <div className="td gender">{item.Gender}</div>
                  <div className="td age">{item.Age}</div>
                  <div className="th feel"><img src={`/emotion_image/${item.EmoName}.png`} className="emo" /></div>
                  <div className="th date">{item.Date}</div>
                  <div className="th time">{item.Time}</div>
                  <div className="td faceimg"><img src={`data:image/jpeg;base64,${item.FaceDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></div>
                  <div className="td bgimg">
                    <button onClick={() => handleBGImage(item.BGDetect)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
                  </div>
                </div>
              ))}
            </>
          }
          {hasClick === false && statusSearchPho === true&&
            <>
              {imageData.map(item => (
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
                    <button onClick={() => handleBGImage(item.BGDetect)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
                  </div>
                </div>
              ))}
            </>
          }
          {hasClick === true && selectedFilter === 'daily' && searchQuery === '' &&
            <> 
              {filterDateDetection.map(item => (
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
                    <button onClick={() => handleBGImage(item.BGDetect)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
                  </div>
                </div>
              ))}
            </>
          }
          {hasClick === true && selectedFilter === 'daily' && searchQuery !== '' &&
            <> 
              {filterDateDetectionSearch.map(item => (
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
                    <button onClick={() => handleBGImage(item.BGDetect)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
                  </div>
                </div>
              ))}
            </>
          }
          {hasClick === true && selectedFilter === 'monthly' && searchQuery === '' &&
            <>
              {filterMonthDetection.map(item => (
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
                    <button onClick={() => handleBGImage(item.BGDetect)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
                  </div>
                </div>
              ))}
            </>
          }
          {hasClick === true && selectedFilter === 'monthly' && searchQuery !== '' &&
            <>
              {filterMonthDetectionSearch.map(item => (
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
                    <button onClick={() => handleBGImage(item.BGDetect)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
                  </div>
                </div>
              ))}
            </>
          }
          {hasClick === true && selectedFilter === 'yearly' && searchQuery === '' &&
            <>
              {filterYearDetection.map(item => (
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
                    <button onClick={() => handleBGImage(item.BGDetect)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
                  </div>
                </div>
              ))}
            </>
          }
          {hasClick === true && selectedFilter === 'yearly' && searchQuery !== '' &&
            <>
              {filterYearDetectionSearch.map(item => (
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
                    <button onClick={() => handleBGImage(item.BGDetect)}><img src={`data:image/jpeg;base64,${item.BGDetect}`} style={{ width: "60px", height: "60px", objectFit: "cover" }} /></button>
                  </div>
                </div>
              ))}
            </>
          }

        </div>
      </div>

      {isModalBGImg && (
        <ModalBgImage onclose={() => setIsModalBGImg(false)} DetectBG={selectDetect} />
      )}
      {isModalChooseImg && (
        <ModalChooseImg onclose={closeModalChooseImg} onsearch = {searchPhoto} onImageData={handleImageData} />
      )}
    </div>
  )
}

export default SearchPage