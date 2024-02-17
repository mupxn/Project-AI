import React, { useEffect, useRef, useState } from 'react';
import './face.css'; // Make sure this path is correct for your CSS

const FaceDetect = () => {
  return (
    <div className="container">
      <div className="video-container">
        <img src="http://localhost:5000/video_feed" alt="Video Stream" style={{ borderRadius: '10px' }} />
      </div>
      <div className="overlay-box">Some content here...</div>
    </div>
  );
};

export default FaceDetect;
