import React, { useState, useEffect } from 'react';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/products/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send cookies for session-based auth if needed
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
    fetchProducts();
  }, []);

  return (
    <div className="product-list-container">
      <h2>Your Uploaded Products</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="product-cards">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="product-card" key={product.id}>
              {/* Assuming image field returns a relative path */}
              <img src={`http://localhost:8000${product.image}`} alt={product.title} />
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p>Price: ${product.second_hand_price}</p>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}

export default ProductList;
