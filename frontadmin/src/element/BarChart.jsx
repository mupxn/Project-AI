import React, { useState, useEffect } from 'react'
import ApexCharts from 'react-apexcharts';
import axios from "axios";
import ChartComponent from "./ChartComponent.css"
function BarChart({current, click, date}) {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: 'basic-bar'
      },
      xaxis: {
        categories: []
      }
    },
    series: []
  });
  const barDataCurrentDate = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/home/barchart/${current}`);
      const { categories, series } = response.data;
      if (categories && series) {
        setChartData({
          options: {
            ...chartData.options,
            xaxis: {
              ...chartData.options.xaxis,
              categories: categories,
            },
          },
          series: [{
            name: "Series Name",
            data: series
          }]
        });
      } else {
        console.error('Categories or Series are undefined');
      }
      console.log(categories);
      console.log(series);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const barData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/home/barchart/${date}`);
      const { categories, series } = response.data;
      console.log(response.data);
      if (categories && series) {
        setChartData({
          options: {
            ...chartData.options,
            xaxis: {
              ...chartData.options.xaxis,
              categories: categories,
            },
          },
          series: [{
            name: "Series Name",
            data: series
          }]
        });
      } else {
        console.error('Categories or Series are undefined');
      }
      console.log(categories);
      console.log(series);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const showclick =()=>{
    console.log(date);
    console.log(current);
  }


  useEffect(() => {
    // Call the function if click is false show current date
    if (click==false) {
      barDataCurrentDate()
      // console.log('Fetching data for current date:', current);
    }
    // Call the function if click is true show when date change
    else if (click==true) {
      barData()
      // console.log('Fetching data for date:', date);
    }
  // console.log(click);
  }, [date]); // Now effect depends on date and click, it runs when either changes
  

  return (
    <div className="Bar">
      <button onClick={showclick}></button>
      <ApexCharts
        options={chartData.options}
        series={chartData.series}
        type="bar"
        width="500"
      />
    </div>
  )
}

export default BarChart