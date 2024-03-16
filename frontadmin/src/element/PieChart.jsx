import React from 'react'
import ApexCharts from 'react-apexcharts';
import ChartComponent from "./ChartComponent.css"
function PieChart() {
    const chartOptions = {
        series: [44, 55, 41, 17, 15], // Sample data
        options: {
          chart: {
            type: 'donut',
          },
          labels: ["happy", "sad", "surprise", "natural", "angry", "fear"],
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
      };
  return (
    <div className="Pie">
      <ApexCharts
        options={chartOptions.options}
        series={chartOptions.series}
        type="pie"
        width="380px"
      />
    </div>
  )
}

export default PieChart