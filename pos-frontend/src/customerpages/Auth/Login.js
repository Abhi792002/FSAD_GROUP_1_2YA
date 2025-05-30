import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Login() {

    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const login = async (event) => {
        event.preventDefault();
        setError(null);
        const data = {
            "username": username,
            "password": password
        }
        try {
            const response = await axios.post("http://localhost:8080/auth/login", data);
            if (response.status === 200) {
                localStorage.setItem("token", response.data);
                localStorage.setItem("username", username);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data}`;
                navigate("/");
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    setError("Account is locked due to multiple failed login attempts. Please contact administrator.");
                } else if (error.response.status === 401) {
                    setError("Invalid username or password");
                } else {
                    setError("An error occurred. Please try again.");
                }
            } else {
                setError("Network error. Please check your connection.");
            }
        }
    }

    const register = () => {
        navigate("/register");
    }

    return (
        <div>
            <div className='background-style'>
                <div className="register-container">
                    <h2>Login</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={login}>
                        <div className="form-group">
                            <label htmlFor="username">Username:</label>
                            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="input-field" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" />
                        </div>
                        <div className='form-group'>
                            <button type="submit" className="register-btn">Login</button>
                        </div>
                        <div className='form-group'>
                            <p onClick={register}>Don't have an account? Register here!</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
