import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Style.css'
export default function AdminProfile() {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  const navigate = useNavigate();

  useEffect(() => {
    // Get username from localStorage when component mounts
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If no token, redirect to login
      navigate('/login');
      return;
    }
    
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!newPassword.trim()) {
      setMessage('Please enter a new password');
      setMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setMessage('User ID not found. Please login again.');
        setMessageType('error');
        return;
      }
      
      const response = await axios.put(
        `http://localhost:8080/users/${userId}/change-password`,
        { 
          newPassword: newPassword 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage('Password successfully reset.');
      setMessageType('success');
      setNewPassword(''); // Clear the password field
      
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage('Unauthorized. Please login again.');
        setMessageType('error');
      } else {
        setMessage('Error resetting password. Please try again.');
        setMessageType('error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <span className="profile-icon">👤</span>
          <h2>Profile</h2>
        </div>
        
        <form onSubmit={handlePasswordReset}>
          <div className="form-group">
            <label>Username:</label>
            <input 
              type="text" 
              value={username} 
              readOnly 
              className="readonly-input"
            />
          </div>
          
          <div className="form-group">
            <label>New Password:</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div className="form-group">
            <button type="submit" className="reset-btn">
              Reset Password
            </button>
          </div>
        </form>
        
        {message && (
          <div className={`message ${messageType}`}>
            {messageType === 'success' ? '✅' : '❌'} {message}
          </div>
        )}
        
        <div className="logout-section">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}