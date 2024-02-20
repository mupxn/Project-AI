import React from "react";
import data from "../data.json";

const ResultBox = () => {
  const detect = [...data.detection].reverse();
  const Usernmae = ({ isActive }) => {
    return (
      <div className={isActive ? 'active-class' : 'inactive-class'}>
        This div changes its class based on isActive.
      </div>
    );
  };

  return (
    <div className="container">
      {detect.map((item) => ( // Removed 'index' since it's not used
        <div key={item.DetectID} className="overlay-box"> 
           <img src={`http://localhost:5000/FaceImg/${item.FaceDetect}`} className="face"/>
           <div></div>
        </div>
      ))}
    </div>
  );
};

export default ResultBox;
