import React, { useState, useEffect } from 'react'
import './HomePage.css'
import axios from "axios";
// import ChartComponent from "./ChartComponent.css"
import ApexCharts from 'react-apexcharts';

function HomePage() {
  // const BASE_URL = process.env.WEB_PORT;
  const today = new Date()
  const maxDateValue = today.toISOString().split('T')[0];
  const maxMonthValue = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  const formattedDate = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
  const formattedMonth = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0')
  const currentDate = formattedDate
  const currentMonth = formattedMonth
  const maxDate = maxDateValue
  const maxMonth = maxMonthValue
  const [filterDate, setFilterDate] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [clickDate, setClickDate] = useState(false)
  const [clickMonth, setClickMonth] = useState(false)
  const handleFilterDate = (e) => {
    const updatedFilterDate = e.target.value;
    setClickDate(true)
    setFilterDate(updatedFilterDate)
  }
  const handleFilterMonth = (e) => {
    const updatedFilterMonth = e.target.value;
    setClickMonth(true)
    setFilterMonth(updatedFilterMonth)
  }
  // --------------------------------   Bar Chart   ---------------------------------------
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
  const barData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/home/barchart/${filterDate}`);
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
  const barDataCurrentDate = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/home/barchart/${currentDate}`);
      const { categories, series } = response.data;
      // console.log(categories);
      // console.log(BASE_URL);
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


  // --------------------------------   Pie Chart   ---------------------------------------
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
      const response = await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/home/piechart/${filterMonth}`);
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
      const response = await axios.get(`${process.env.REACT_APP_WEB_PORT}/api/home/piechart/${currentMonth}`);
      const { series, labels } = response.data;
      if (labels && series) {
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

  // --------------------------------   Line Chart   ---------------------------------------
  const [chartDataLine, setChartDataLine] = useState({
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
  const showDataYear = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_WEB_PORT}/emotion_data`);
      const transformData = transformDataForLineChart(response.data)
      setChartDataLine(prevState => ({
        ...prevState,
        series: transformData
      }));
      // console.log(transformData)
      // console.log(organizedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  const transformDataForLineChart = (data) => {
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
  useEffect(() => {
    showDataYear()
    if (clickDate==false) {
      barDataCurrentDate()
    }
    else {
      barData()
    }
    if (clickMonth==false) {
      pieDataCurrentDate()
    }
    else {
      pieData()
    }
    // barDataCurrentDate()
    // pieDataCurrentDate()
  }, [filterMonth,filterDate]);
  const print =()=>{
    const porttest = process.env.REACT_APP_WEB_PORT;
    console.log(porttest);
  }
  return (
    <div className="Home">
      <div className="head-home">HomePage</div>
      
      <div className="chart">
        <div className="s-chart">
        
          <div className="bar-chart">
          <input type='date' max={maxDate} onChange={handleFilterDate}></input>
            <ApexCharts
              options={chartDataBar.options}
              series={chartDataBar.series}
              type="bar"
              width="500"
            />
          </div>
          <div className="pie-chart">
          <input type='month' max={maxMonth} onChange={handleFilterMonth}></input>
            <ApexCharts
              options={chartDataPie.options}
              series={chartDataPie.series}
              type="pie"
              width="380px"
            />
          </div>
        </div>
        <div className="line-chart">
          <ApexCharts
            options={chartDataLine.options}
            series={chartDataLine.series}
            type="line"
            width="100%"
            height="400px"
          />
        </div>
      </div>
    </div>

  )
}

export default HomePage