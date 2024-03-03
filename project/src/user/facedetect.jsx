import React, { useEffect, useRef, useState } from "react";
import "./face.css"; // Make sure this path is correct for your CSS
import axios from "axios";

const FaceDetect = () => {

  const [detect, setDetection] = useState([]);
  const fetchInterval = 500;

  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:5000/user/showresult')
        .then(response => {
          setDetection(response.data); 
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    };

    fetchData(); // Fetch data immediately on component mount

    const interval = setInterval(fetchData, fetchInterval); // Set up a timer to fetch data repeatedly

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);
  

  return (
    <div className="container">
      <div className="video-container">
        <img
          src="http://localhost:5000//video_feed"
          style={{ borderRadius: "10px" }}
          className="img"
        />
      </div>
      <div className="result-container">
        {detect.map((item) => (
          <div key={item.DetectID} className="overlay-box">
            <img
              src={`data:image/jpeg;base64,${item.FaceDetect}`}
              className="face"
            />
            <div className="text-box">
              <div className="row">
                <div className="info">Name : {item.Name}</div>
                <div className="info-right">Gender : {item.Gender}</div>
              </div>
              <div className="row right">
                <div className="info">Age : {item.Age}</div>
                <div className="info-right">
                  Time : {item.Date} {item.Time}
                </div>
              </div>
            </div>
            <div className="emotional">
              <img src={`/emotion_image/${item.EmoName}.png`} className="emo" />
              <div className="emoname">{item.EmoName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaceDetect;
