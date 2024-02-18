import React from "react";
import data from "../data.json";

const ResultBox = () => {
  const detect = [...data.detection].reverse();

  return (
    <div className="container">
      {detect.map((item, index) => (
        <div className="overlay-box">
          <div key={item.DetectID}>
            {item.DetectID}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultBox;
