import React, { useEffect, useState } from 'react';
import AdminNavBar from './components/AdminNavBar';
import './Admin.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminOrder() {
  const [checkouts, setCheckouts] = useState(null);
  const [selectedCheckout, setSelectedCheckout] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCheckouts();
  }, []);

  const getCheckouts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/checkouts");
      setCheckouts(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/admin/login");
      }
    }
  };

  const deleteCheckout = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/checkouts/${id}`);
      const updatedCheckouts = checkouts.filter((checkout) => checkout.id !== id);
      setCheckouts(updatedCheckouts);
    } catch (error) {
      console.error("Error deleting checkout:", error);
    }
  };

  const openDialog = (checkout) => {
    setSelectedCheckout(checkout);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedCheckout(null);
  };

  return (
    <div>
      <AdminNavBar />
      <br />
      <h2>All Checkouts</h2>
      <br />
      {checkouts && checkouts.length > 0 && (
        <table className="category-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {checkouts.map((checkout) => (
              <tr key={checkout.id}>
                <td>{checkout.id}</td>
                <td>{checkout.total}</td>
                <td>
                  <button onClick={() => openDialog(checkout)}>View More</button>
                  &nbsp;
                  <button onClick={() => deleteCheckout(checkout.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dialogOpen && selectedCheckout && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> {selectedCheckout.id}</p>
            <p><strong>Order Time:</strong> {new Date(selectedCheckout.orderTime).toLocaleString()}</p>
            <table className="category-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedCheckout.checkoutItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.item.price}</td>
                    <td>{(item.item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
            <button onClick={closeDialog}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
