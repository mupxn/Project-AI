import React, { useState, useEffect } from 'react'
import './HomePage.css'
import BarChart from "../element/BarChart.jsx";
import PieChart from "../element/PieChart.jsx";
import LineChart from "../element/LineChart.jsx";
import axios from "axios";

function HomePage() {
  //useEffect ren after first render
  const today = new Date()
  const formattedDate = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
  const formattedMonth = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0')
  const [currentDate, setCurrentDate] = useState(formattedDate);
  const [currentMonth, setCurrentMonth] = useState(formattedMonth)
  const [maxDate, setMaxDate] = useState('');
  const [maxMonth, setMaxMonth] = useState('');
  const [filterDate, setFilterDate] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [clickDate, setClickDate] = useState(false)
  const [clickMonth, setClickMonth] = useState(false)
  const [clickYear, setClickYear] = useState(false)
  const handleFilterDate = async (e) => {
    const updatedFilter = e.target.value;
    setClickDate(true)
    setFilterDate(updatedFilter)
  }
  const handleFilterMonth = async (e) => {
    const updatedFilter = e.target.value;
    setClickMonth(true)
    setFilterMonth(updatedFilter)
  }
  const handleFilterYear = async (e) => {
    const updatedFilter = e.target.value;
    setClickYear(true)
    setFilterYear(updatedFilter)
  }
  useEffect(() => {
    const today = new Date()
    const maxDateValue = today.toISOString().split('T')[0];
    const maxMonthValue = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    setMaxMonth(maxMonthValue);
    setMaxDate(maxDateValue);
  }, []);
  return (
    <div className="Home">
      <div className="head-home">HomePage</div>

      <div className="filter-home">
        <div className="filter">
          <form>
            <input type='date' max={maxDate} onChange={handleFilterDate}></input>
          </form>
        </div>

        <div className="filter-home">
          <form>
            <input type='month' max={maxMonth} onChange={handleFilterMonth}></input>
          </form>
        </div>

        <div className="filter-home">
          <form>
            <select onChange={handleFilterYear}>
              <option >2019</option>
              <option >2020</option>
              <option >2021</option>
              <option >2022</option>
              <option >2023</option>
              <option value="2024">2024</option>
            </select>
          </form>
        </div>
      </div>

      <div className="chart">
        <div className="s-chart">
          <div className="bar-chart">
            <BarChart current={currentDate} click={clickDate}date={filterDate} />
          </div>
          <div className="pie-chart">
            <PieChart current={currentMonth} click={clickMonth} month={filterMonth}/>
          </div>
        </div>
        <div className="line-chart">
          <LineChart  click={clickYear} year={filterYear}/>
        </div>
      </div>
    </div>

  )
}

export default HomePage