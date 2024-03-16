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
      console.log(date);
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
      console.log(categories);
      console.log(series);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Call the function if click is false show current date
    if (!click) {
      barDataCurrentDate()
      // console.log('Fetching data for current date:', current);
    }
    // Call the function if click is true show when date change
    else if (click) {
      barData()
      // console.log('Fetching data for date:', date);
    }
  }, [date, click]); // Now effect depends on date and click, it runs when either changes

  return (
    <div className="Bar">
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