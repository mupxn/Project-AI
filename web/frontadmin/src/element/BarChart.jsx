import React, { useState, useEffect } from 'react'
import ApexCharts from 'react-apexcharts';
import axios from "axios";
import ChartComponent from "./ChartComponent.css"
function BarChart({current, click, date}) {
  const [chartDataBar, setChartDataBar] = useState({
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
      // console.log(categories);
      // console.log(series);
      if (categories && series) {
        setChartDataBar({
          options: {
            ...chartDataBar.options,
            xaxis: {
              ...chartDataBar.options.xaxis,
              categories: categories,
            },
          },
          series: [{
            name: "Name",
            data: series
          }]
        });
      } else {
        console.error('Categories or Series are undefined');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const barData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/home/barchart/${date}`);
      const { categories, series } = response.data;
      // console.log(categories);
      // console.log(series);
      if (categories && series) {
        setChartDataBar({
          options: {
            ...chartDataBar.options,
            xaxis: {
              ...chartDataBar.options.xaxis,
              categories: categories,
            },
          },
          series: [{
            name: "Name",
            data: series
          }]
        });
      } else {
        console.error('Categories or Series are undefined');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const showclick =()=>{
    console.log(date);
    console.log(current);
  }


  useEffect(() => {
    if (click==false) {
      barDataCurrentDate()
    }
    else if (click==true) {
      barData()
    }
  }, [date,click]);
  

  return (
    <div className="Bar">
      {/* <button onClick={showclick}></button> */}
      <ApexCharts
        options={chartDataBar.options}
        series={chartDataBar.series}
        type="bar"
        width="500"
      />
    </div>
  )
}

export default BarChart