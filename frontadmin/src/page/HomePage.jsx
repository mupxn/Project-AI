import React from 'react'
import './HomePage.css'
import BarChart from "../element/BarChart.jsx";
import PieChart from "../element/PieChart.jsx";
import LineChart from "../element/LineChart.jsx";

function HomePage() {
  
  return (
    <div className="Home">
      <div className="head-home">HomePage</div>
      <div className="bar-chart">
        <BarChart/>
      </div>
      <div className="pie-chart">
        <PieChart/>
      </div>
      <div className="line-chart">
        <LineChart/>
      </div>
    </div>
    
  )
}

export default HomePage