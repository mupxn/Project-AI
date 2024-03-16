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
            categories: ["happy", "sad", "surprise", "natural", "angry", "fear"]
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
            data: [30, 40, 45, 50, 49, 60]
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