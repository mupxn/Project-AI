import React, { useState, useEffect } from 'react'
import ApexCharts from 'react-apexcharts';
import axios from "axios";
import ChartComponent from "./ChartComponent.css"
function PieChart({ current, click, month }) {
  const [chartDataPie, setChartDataPie] = useState({
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
    try {
      const response = await axios.get(`http://localhost:5000/api/home/piechart/${month}`);
      const { series, labels } = response.data;
      console.log(labels)
      console.log(series)
      if (labels && series){
        setChartDataPie({
          series: series,
          options: {
            ...chartDataPie.options,
            labels: labels,
          },
        });
      } else {
        console.error('Categories or Series are undefined');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const pieDataCurrentDate = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/home/piechart/${current}`);
      const { series, labels } = response.data;
      if (labels && series){
        setChartDataPie({
          series: series,
          options: {
            ...chartDataPie.options,
            labels: labels,
          },
        });
      } else {
        console.error('series or labels are undefined');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    if (!click) {
      pieDataCurrentDate()
    }
    else if (click) {
      pieData()
    }
  }, [month, click]);

  return (
    <div className="Pie">
      <ApexCharts
        options={chartDataPie.options}
        series={chartDataPie.series}
        type="pie"
        width="380px"
      />
    </div>
  )
}

export default PieChart