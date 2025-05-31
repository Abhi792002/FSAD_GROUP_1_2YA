//import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';

import '../Style.css'
export default function NavBar() {
    const navigate = useNavigate();
        const username = localStorage.getItem("username") || "User";
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);
    

    const home = () => {
        navigate("/");
    }
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const logout = async () => {
        const oBody = {
            username: localStorage.getItem("username"),
            password: ""
        };
        axios.post("http://localhost:8080/auth/logout",oBody);
        localStorage.removeItem("token");
        navigate("/login");
    }
    const goToProfile = () => {
        navigate("/edit-profile");
        setIsOpen(false);
    };

    return (
        <div>
            <div>
                <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
                    <div className="container-fluid">
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                            <a className="navbar-brand" href="">POS Software</a>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <a className="nav-link" aria-current="page" href="" onClick={home}>Home</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href='' >Cart</a>
                                </li>
                            </ul>
                            <div className="dropdown" ref={dropdownRef}>
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            alt="Profile"
                            width="32"
                            height="32"
                            className="rounded-circle"
                            style={{ cursor: "pointer", objectFit: "cover" }}
                            onClick={toggleDropdown}
                        />
                        {isOpen && (
                            <ul className="custom-dropdown-menu">
                                <li onClick={goToProfile}>👤 Profile</li>
                                <li onClick={logout}>🚪 Logout</li>
                            </ul>
                        )}
                    </div>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    )
}
