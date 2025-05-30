import React, { useEffect, useState } from 'react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AdminNavBar from './components/AdminNavBar';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, ChartDataLabels);

const AdminSalesReport = () => {
  const [period, setPeriod] = useState('monthly');
  const [type, setType] = useState('totalSales');
  const [chartData, setChartData] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/salesDates')
      .then(res => {
        const parsedDates = res.data.map(dateStr => new Date(dateStr));
        setHighlightedDates(parsedDates);
      });
  }, []);


  useEffect(() => {
    fetchReport();
  }, [period, type, endDate]);

  const fixedColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#66FF66', '#FF6666',
  ];

  const fetchReport = async () => {
    try {
      // 🔄 Reset chart before fetching new data
      setChartData({
        labels: [],
        datasets: []
      });
  
      let response;
      const token = localStorage.getItem("token");
  
      if (period === 'custom' && startDate && endDate) {
        const start = startDate.toLocaleDateString('sv-SE');
        const end = endDate.toLocaleDateString('sv-SE');
  
        response = await axios.get('http://localhost:8080/sales', {
          params: {
            period,
            reportType: type,
            startDate: start,
            endDate: end
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        response = await axios.get(`http://localhost:8080/sales?period=${period}&reportType=${type}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
  
      const rawData = response.data;
  
      const labels = rawData.map(item => item.label);
      const values = rawData.map(item => item.total);
      const backgroundColors = labels.map((_, idx) => fixedColors[idx % fixedColors.length]);
  
      setChartData({
        labels,
        datasets: [
          {
            label: getChartLabel(type),
            data: values,
            backgroundColor: type === 'categorySales' ? backgroundColors : 'rgba(75, 192, 192, 1)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      });
    } catch (error) {
      console.error("Failed to fetch sales report", error);
    }
  };

  const getChartLabel = (type) => {
    switch (type) {
      case 'totalSales': return 'Total Sales Amount (₹)';
      case 'ordersCount': return 'Number of Orders';
      case 'categorySales': return 'Category Sales Amount (₹)';
      default: return '';
    }
  };

  return (
    <div>
      <AdminNavBar />
      <div style={{ padding: '20px' }}>
        <h2>Sales Report</h2>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label>Period:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label>Report Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="totalSales">Total Sales</option>
              <option value="ordersCount">Order Count</option>
              <option value="categorySales">Category Sales</option>
            </select>
          </div>

          {period === 'custom' && (
                <div>
                  <label>Select Date Range:</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(dates) => {
                      const [start, end] = dates;
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    inline
                  />
                </div>
              )}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '400px', margin: '0 auto' }}>
          {chartData && chartData.labels ? (
            type === 'categorySales' ? (
              <Pie
                    data={chartData}
                    options={{
                      plugins: {
                        datalabels: {
                          formatter: (value, context) => {
                            const total = context.chart._metasets[0].total;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${percentage}%`;
                          },
                          color: '#fff',
                          font: {
                            weight: 'bold',
                            size: 14
                          }
                        },
                        legend: {
                          display: true,
                          position: 'top'
                        },
                        tooltip: {
                          callbacks: {
                            label: (tooltipItem) => {
                              const dataset = tooltipItem.dataset;
                              const value = dataset.data[tooltipItem.dataIndex];
                              const total = dataset.data.reduce((acc, val) => acc + val, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${tooltipItem.label}: ₹${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
            ) : (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Date',
                        font: { size: 14, weight: 'bold' }
                      },
                      ticks: {
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 0
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: type === 'ordersCount' ? 'Number of Orders' : 'Sales Amount (₹)',
                        font: { size: 14, weight: 'bold' }
                      },
                      beginAtZero: true
                    }
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                          label: (tooltipItem) => {
                            const dataset = tooltipItem.dataset;
                            const value = dataset.data[tooltipItem.dataIndex];
                            const isOrderCount = type === 'ordersCount';
                            return `${tooltipItem.label}: ${isOrderCount ? value : `₹${value}`}`;
                          }
                       }
                    }
                  }
                }}
              />
            )
          ) : (
            <p>Loading chart...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSalesReport;