// src/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://ladyfirstme.pythonanywhere.com/api/auth/products/', {
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
    fetchProducts();
  }, []);

  // Construct a full URL for the image
  const getImageUrl = (product) => {
    // If your serializer returns an absolute URL in `image_url`, use that
    if (product.image_url) return product.image_url;
    // Otherwise, assume the image field is a relative path under /media/
    return `https://ladyfirstme.pythonanywhere.com/media/${product.image}`;
  };

  return (
    <div className="product-list-container">
      <h2>All Products</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="product-cards">
        {products.length > 0 ? (
          products.map((product) => (
            // Wrap each card in a Link so that clicking it navigates to the product detail page
            <Link key={product.id} to={`/products/${product.id}`} className="product-link">
              <div className="product-card">
                <img src={getImageUrl(product)} alt={product.title} />
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

export default ProductList;
