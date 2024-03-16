import React, { useState, useEffect } from 'react'
import ApexCharts from 'react-apexcharts';
import axios from "axios";
import ChartComponent from "./ChartComponent.css"
function PieChart({ current, click, month }) {
  const [chartData, setChartData] = useState({
    // '1', '0', '1', '0', '0', '1'
    series: [],
    options: {
      chart: {
        type: 'pie',
      },
      // 'fear', 'angry', 'neutral', 'surprise', 'sad', 'happy'
      labels: [],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    },
  });
  const pieData = async () => {
    console.log(month);
    try {
      const response = await axios.get(`http://localhost:5000/api/home/piechart/${month}`);
      const { series, labels } = response.data;
      setChartData({
        series: series,
        options: {
          ...chartData.options,
          labels: labels,
        },
      });
      console.log(labels)
      console.log(series)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  // const pieDataCurrentDate = async () => {
  //   try {
  //     const response = await axios.get(`http://localhost:5000/api/home/piechart/${current}`);
  //     const { data } = response;
  //     setChartData({
  //       ...chartData,
  //       series: data.series,
  //       options: {
  //         ...chartData.options,
  //         labels: data.labels,
  //       },
  //     });
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };
  useEffect(() => {
    pieData()
    // Call the function if click is false show current date
    // if (!click) {
    //   pieDataCurrentDate()
    //   console.log('Fetching data for current date:', current);
    // }
    // // Call the function if click is true show when date change
    // else if (click) {
    //   pieData()
    //   console.log('Fetching data for month:', month);
    // }
  }, [month, click]); // Now effect depends on date and click, it runs when either changes

  return (
    <div className="Pie">
      <ApexCharts
        options={chartData.options}
        series={chartData.series}
        type="pie"
        width="380px"
      />
    </div>
  )
}

export default PieChart