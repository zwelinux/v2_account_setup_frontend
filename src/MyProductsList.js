// src/MyProductsList.js
import React, { useState, useEffect } from 'react';
import './MyProductsList.css';
import { Link } from 'react-router-dom';


function MyProductsList({ refresh }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const fetchMyProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/myproducts/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Failed to load products.');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [refresh]);

  return (
    <div className="my-products-container">
      <h2>My Uploaded Products</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="product-cards">
        {products.length > 0 ? (
          products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="product-link">
            <div className="product-card" key={product.id}>
              <img src={product.image} alt={product.title} />
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.second_hand_price}</p>
            </div>
            </Link>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}

export default MyProductsList;
