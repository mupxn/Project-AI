import React, { useEffect, useRef, useState } from 'react';
import './face.css'; // Make sure this path is correct for your CSS
import ResultBox from '../component/ResultBox';

const FaceDetect = () => {
  return (
    <div className="container">
      <div className="video-container">
        <img src="http://localhost:5000/video_feed"style={{ borderRadius: '10px' }} className='img' />
      </div>
      <ResultBox/>
    </div>
  );
};

export default FaceDetect;
