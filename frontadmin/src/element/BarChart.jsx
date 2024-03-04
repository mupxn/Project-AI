import React from 'react'
import ApexCharts from 'react-apexcharts';
import ChartComponent from "./ChartComponent.css"
function BarChart() {
    const chartOptions = {
        options: {
          chart: {
            id: 'basic-bar'
          },
          xaxis: {
            categories: ["happy", "sad", "surprise", "angry", "natural", "disguss", "fear"]
          }
        },
        series: [
          {
            name: 'series-1',
            data: [30, 40, 45, 50, 49, 60, 70]
          }
        ]
      };
  return (
    <div className="Bar">
      <ApexCharts
        options={chartOptions.options}
        series={chartOptions.series}
        type="bar"
        width="500px"
      />
    </div>
  )
}

export default BarChart