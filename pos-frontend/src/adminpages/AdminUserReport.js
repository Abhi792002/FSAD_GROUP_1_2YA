import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import AdminNavBar from './components/AdminNavBar'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fixedColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#66D7D1', '#9ED763', '#E46FB2', '#7C83FD'
];

const UserActivityDashboard = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loginLogs, setLoginLogs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchUserHours = async () => {
      try {
        const res = await axios.get("http://localhost:8080/userHours", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;
        const grouped = {};
        data.forEach(item => {
          if (!grouped[item.date]) grouped[item.date] = {};
          grouped[item.date][item.user] = item.hours;
        });

        const labels = Object.keys(grouped);
        const users = [...new Set(data.map(d => d.user))];

        const datasets = users.map((user, i) => ({
          label: user,
          data: labels.map(date => grouped[date][user] || 0),
          backgroundColor: fixedColors[i % fixedColors.length]
        }));

        setChartData({ labels, datasets });
      } catch (err) {
        console.error("Error fetching user hours", err);
      }
    };

    const fetchLoginLogs = async () => {
      try {
        const res = await axios.get("http://localhost:8080/loginDetails", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLoginLogs(res.data);
      } catch (err) {
        console.error("Error fetching login logs", err);
      }
    };

    fetchUserHours();
    fetchLoginLogs();
  }, []);

  return (
    <div>
        <AdminNavBar />
        <div style={{ padding: '2rem' }}>
      <h2>User Working Hours Per Day</h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Total Hours Worked Per User Per Day' }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Hours Worked'
              }
            }
          }
        }}
      />

      <h2 style={{ marginTop: '3rem' }}>User Login Logs</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={thStyle}>User ID</th>
            <th style={thStyle}>User</th>
            <th style={thStyle}>Login Time</th>
            <th style={thStyle}>Logout Time</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {loginLogs.map(log => (
            <tr key={log.id}>
              <td style={tdStyle}>{log.user.id}</td>
              <td style={tdStyle}>{log.user.username}</td>
              <td style={tdStyle}>{formatDate(log.loginTime)}</td>
              <td style={tdStyle}>{log.logoutTime ? formatDate(log.logoutTime) : '—'}</td>
              <td style={tdStyle}>{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
    
    
  );
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const thStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'center'
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #ddd'
};

export default UserActivityDashboard;
