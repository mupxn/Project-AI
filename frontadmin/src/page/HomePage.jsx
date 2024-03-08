import React,{useState,useEffect} from 'react'
import './HomePage.css'
import BarChart from "../element/BarChart.jsx";
import PieChart from "../element/PieChart.jsx";
import LineChart from "../element/LineChart.jsx";

function HomePage() {
  const [maxDate, setMaxDate] = useState('');
  const [maxMonth, setMaxMonth] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('')
  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    setSelectedFilter(filterValue)
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
      <div className="filter-wrap-home">
        <div className="filter-home">
          <div className="filter">
            <select onChange={handleFilterChange}>
              <option >-</option>
              <option value="daily">daily</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </div>
          <div className='show-filter'>

            {selectedFilter === 'daily' &&
              <>
                <form>
                  <input type='date' max={maxDate}></input>
                </form>
              </>
            }
            {selectedFilter === 'monthly' &&
              <>
                <form>
                  <input type='month' max={maxMonth}></input>
                </form>
              </>

            }
            {selectedFilter === 'yearly' &&
              <>
                <form>
                
                </form>
              </>
            }

          </div>

        </div>
      </div>
      <div className="chart">
        <div className="s-chart">
          <div className="bar-chart">
            <BarChart />
          </div>
          <div className="pie-chart">
            <PieChart />
          </div>
        </div>
        <div className="line-chart">
          <LineChart />
        </div>
      </div>

    </div>

  )
}

export default HomePage