import React from 'react'
import ApexCharts from 'react-apexcharts';
import axios from "axios";
import ChartComponent from "./ChartComponent.css"
function LineChart({ current, click, year }) {
    const chartOptions = {
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
              format: 'yyyy'
            }
          },
        },
        series: [
          {
            name: 'Series 1',
            data: [30, 40, 45, 50, 49, 60,30, 40, 45, 50, 49, 60]
          },
          {
            name: 'Series 2',
            data: [3, 20, 90, 23, 100,33,1, 5, 3, 4, 1, 7]
          }
        ]
      };
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
      <ApexCharts
        options={chartOptions.options}
        series={chartOptions.series}
        type="line"
        width="100%"
        height="400px"
      />
    </div>
  )
}

export default LineChart