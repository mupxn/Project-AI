import React from 'react'
import ApexCharts from 'react-apexcharts';
import ChartComponent from "./ChartComponent.css"
function LineChart() {
    const chartOptions = {
        options: {
          chart: {
            id: 'basic-line'
          },
          xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
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
            data: [30, 40, 45, 50, 49, 60, 70, 91, 125]
          }
        ]
      };
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