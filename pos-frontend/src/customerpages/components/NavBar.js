import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function NavBar() {

    const navigate = useNavigate();

    const home = () => {
        navigate("/");
    }

    const logout = async () => {
        const oBody = {
            username: localStorage.getItem("username"),
            password: ""
        };
        axios.post("http://localhost:8080/auth/logout",oBody);
        localStorage.removeItem("token");
        navigate("/login");
    }

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
                            <form className="d-flex" role="search">
                                <button className="btn btn-primary" onClick={logout}>Logout</button>
                            </form>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    )
}
