import React, { useState, useEffect } from 'react'
import ApexCharts from 'react-apexcharts';
import axios from "axios";
import ChartComponent from "./ChartComponent.css"
function LineChart() {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: 'basic-line'
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      },
      stroke: {
        curve: 'smooth'
      },
      tooltip: {
        x: {
          format: 'MM'
        }
      },
    },
    series: []
  });
  const showData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/emotion_data');
      const transformData = transformDataForChart(response.data)
      setChartData(prevState => ({
        ...prevState,
        series: transformData
      }));
      // console.log(transformData)
      // console.log(organizedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  const transformDataForChart = (data) => {
    const newData = {};
    data.forEach(([emotion, month, occurrences]) => {
      // If the emotion isn't already a key in the dictionary, add it with a list of 12 zeros (for each month)
      if (!(emotion in newData)) {
        newData[emotion] = Array(12).fill(0);
      }
      // Add the occurrences to the correct month (subtract 1 since list indices start at 0)
      newData[emotion][month - 1] += occurrences;
    });
    const seriesData = Object.keys(newData).map(emotion => ({
      name: emotion,
      data: newData[emotion],
    }));
    return seriesData;
  };
  useEffect(()=>{
    showData()
  },[])
  return (
    <div className="Line">
      
      <ApexCharts
        options={chartData.options}
        series={chartData.series}
        type="line"
        width="100%"
        height="400px"
      />
    </div>
  )
}

export default LineChart