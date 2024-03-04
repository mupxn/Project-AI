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
          labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
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
        width="380"
      />
    </div>
  )
}

export default PieChart