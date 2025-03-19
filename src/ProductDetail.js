// src/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`https://ladyfirstme.pythonanywhere.com/api/auth/products/${id}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setError('Failed to load product details.');
        }
      } catch (err) {
        setError('Error: ' + err.message);
      }
    }
    fetchProduct();
  }, [id]);  // Only depends on the id from useParams

  if (error) return <p className="error-message">{error}</p>;
  if (!product) return <p>Loading product details...</p>;

  return (
    <div className="product-detail-container">
      <h2>{product.title}</h2>
      {/* Use image_url if available or build the URL using product.image */}
      <img src={product.image_url ? product.image_url : `https://ladyfirstme.pythonanywhere.com/media/${product.image}`} alt={product.title} />
      <p>{product.description}</p>
      <p>Price: ${product.second_hand_price}</p>
      <p>Condition: {product.condition}</p>
      <p>Size: {product.size}</p>
      <p>Color: {product.color}</p>
    </div>
  );
}

export default ProductDetail;
