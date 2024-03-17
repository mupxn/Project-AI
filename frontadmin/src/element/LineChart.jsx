import React, { useState, useEffect } from 'react'
import ApexCharts from 'react-apexcharts';
import axios from "axios";
import ChartComponent from "./ChartComponent.css"
function LineChart() {
  // const [chartData, setChartData] = useState({
  //     options: {
  //       chart: {
  //         id: 'basic-line'
  //       },
  //       xaxis: {
  //         categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  //       },
  //       stroke: {
  //         curve: 'smooth'
  //       },
  //       tooltip: {
  //         x: {
  //           format: 'yyyy'
  //         }
  //       },
  //     },
  //     series: [
  //       {
  //         name: 'Series 1',
  //         data: [30, 40, 45, 50, 49, 60,30, 40, 45, 50, 49, 60]
  //       },
  //       {
  //         name: 'Series 2',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 3',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 4',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 5',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 6',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 7',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 8',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 9',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 10',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 11',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       },
  //       {
  //         name: 'Series 12',
  //         data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
  //       }
  //     ]
  //   });
  const showData = () => {
    try {
      const response = axios.get(`http://localhost:5000/emotion_data`);
      const transformedData = transformDataForChart(response.data);
      // setChartData(prevState => ({
      //   ...prevState,
      //   series: transformedData
      // }));
      console.log(transformedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  function transformDataForChart(data) {
    const emotionsByMonth = data.reduce((acc, { EmoName, Month, EmotionCount }) => {
      if (!acc[EmoName]) {
        acc[EmoName] = Array(12).fill(0); // Initialize with zeros for months without data
      }
      acc[EmoName][Month - 1] = EmotionCount; // Month - 1 because array is zero-indexed
      return acc;
    }, {});

    return Object.entries(emotionsByMonth).map(([name, counts]) => ({
      name,
      data: counts
    }));
  }
  // const lineDataCurrentDate = async () => {
  //   try {
  //     const response = await axios.get(`http://localhost:5000/api/home/barchart/${current}`);
  //     const { data } = response;
  //     setChartData({
  //       options: {
  //         ...chartData.options,
  //         xaxis: {
  //           ...chartData.options.xaxis,
  //           categories: data.categories,
  //         },
  //       },
  //       series: data.series,
  //     });
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };
  // const lineData = async () => {
  //   try {
  //     const response = await axios.get(`http://localhost:5000/api/home/barchart`);
  //     const { data } = response;
  //     setChartData({
  //       options: {
  //         ...chartData.options,
  //         xaxis: {
  //           ...chartData.options.xaxis,
  //           categories: data.categories,
  //         },
  //       },
  //       series: data.series,
  //     });
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };
  return (
    <div className="Line">
      <button onClick={showData}></button>
      {/* <ApexCharts
        options={chartData.options}
        series={chartData.series}
        type="line"
        width="100%"
        height="400px"
      /> */}
    </div>
  )
}

export default LineChart