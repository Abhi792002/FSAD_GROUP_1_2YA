import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import './Style.css';
import toast from "bootstrap/js/src/toast";

export default function Home() {
    const navigate = useNavigate();
    const [items, setItems] = useState(null);
    const [checkouts, setCheckouts] = useState([]);
    const [total, setTotal] = useState(0);
    const [showDialog, setShowDialog] = useState(false);
    const [customerAmount, setCustomerAmount] = useState('');
    const [change, setChange] = useState(0);
    const [quantities, setQuantities] = useState({});


    useEffect(() => {
        getItems();
    }, [])

    const getItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get("http://localhost:8080/items", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setItems(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/login");
            }
        }
    }

    const updateQuantity = (itemId, change) => {
        setQuantities(prev => {
            const currentQty = prev[itemId] || 1;
            const newQty = Math.max(1, currentQty + change); // Prevent less than 1
            return { ...prev, [itemId]: newQty };
        });
    };

    const saveOrder = async () => {
        const itemMap = {};

        checkouts.forEach((obj) => {
            if (itemMap[obj.id]) {
                itemMap[obj.id].qty += 1;
            } else {
                itemMap[obj.id] = {
                    itemId: obj.id,
                    qty: 1
                };
            }
        })
        const checkoutItemList = Object.values(itemMap);

        const data = {
            checkoutItemList:checkoutItemList,
            totalAmount : total
        }
        const response = await axios.post("http://localhost:8080/checkouts", data);
        if (response.status === 200) {
            alert("Order Completed");
            setCheckouts([]);
            setTotal(0);
        } else {
            console.log("error!")
        }
    }

    return (
        <div>
            <NavBar />
            <div className='container'>
                <div className='heading text-center'>
                    <h1></h1>
                </div>
            </div>
            <div className='row'>
                <div className='col-md-6'>
                    <div className='col-md-12'>
                        <h1>Items</h1>
                        <div className='row'>
                            {items && items.map(item => {
                                const qty = quantities[item.id] || 1;
                                return (
                                    <div key={item.id} className='col-md-6 mb-3'>
                                        <div className='products shadow-sm boardered bg-light px-3 py-3'>
                                            <h5 style={{textAlign: 'left'}}>{item.name}</h5>
                                            <h5 style={{textAlign: 'left'}}>Rs. {item.price}</h5>
                                            <p style={{textAlign: 'left', fontSize: '0.9em', color: '#555'}}>
                                                Batch No: {item.stockEntity?.batchNo || 'N/A'}
                                            </p>
                                            <div className='d-flex justify-content-between align-items-center mt-3 item-actions'>
                                                <div className='quantity-control'>
                                                    <button
                                                        className='qty-btn'
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >−</button>
                                                    <span className='qty-value'>{quantities[item.id] || 1}</span>
                                                    <button
                                                        className='qty-btn'
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >+</button>
                                                </div>
                                                <button
                                                    className='btn btn-primary add-btn'
                                                    onClick={() => {
                                                        const qty = quantities[item.id] || 1;
                                                        const existingIndex = checkouts.findIndex(cartItem => cartItem.id === item.id);
                                                        let updatedCart = [...checkouts];

                                                        if (existingIndex >= 0) {
                                                            // If item already exists, update its quantity
                                                            updatedCart[existingIndex].qty += qty;
                                                        } else {
                                                            // If item is new, add it with the selected qty
                                                            updatedCart.push({ ...item, qty: qty });
                                                        }

                                                        setCheckouts(updatedCart);
                                                        setTotal(prevTotal => prevTotal + item.price * qty);
                                                        quantities[item.id] = 1;
                                                    }}
                                                >
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <h1>Cart</h1>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Item ID</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Batch No</th>
                                <th>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkouts.map(items => (
                                <tr>
                                    <td>{items.id}</td>
                                    <td>{items.name}</td>
                                    <td>{items.price}</td>
                                    <td>{items.stockEntity?.batchNo || 'N/A'}</td>
                                    <td>{items.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                        <thead>
                            <tr>
                                <th colSpan={4}>Total (Rs.)</th>
                                <th>{total}</th>
                            </tr>
                        </thead>
                    </table>
                    <button className='btn btn-primary' onClick={() => setShowDialog(true)}>Save Order</button>
                </div>
            </div>
            {showDialog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#fff', padding: 30, borderRadius: 8, minWidth: 300 }}>
                        <h4>Order Summary</h4>
                        <p>Total Amount: <b>Rs. {total}</b></p>
                        <div>
                            <label>Customer Amount: </label>
                            <input
                                type="number"
                                value={customerAmount}
                                onChange={e => {
                                    setCustomerAmount(e.target.value);
                                    setChange(e.target.value - total);
                                }}
                                min={total}
                            />
                        </div>
                        <p>Change: <b>Rs. {change >= 0 ? change : 0}</b></p>
                        <button
                            className='btn btn-success'
                            disabled={customerAmount < total}
                            onClick={async () => {
                                await saveOrder();
                                setShowDialog(false);
                                setCustomerAmount('');
                                setChange(0);
                            }}
                        >Confirm</button>
                        <button className='btn btn-secondary' style={{ marginLeft: 10 }} onClick={() => setShowDialog(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}