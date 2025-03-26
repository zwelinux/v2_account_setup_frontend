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
        const response = await fetch(`https://ladyfirstme.pythonanywhere.com/api/auth/products/${id}/`);
        const data = await response.json();
        if (response.ok) {
          setProduct(data);
        } else {
          setError('Failed to load product details.');
        }
      } catch (err) {
        setError('Error: ' + err.message);
      }
    }

    fetchProduct();
  }, [id]);

  if (error) return <p className="error-message">{error}</p>;
  if (!product) return <p>Loading product details...</p>;

  const discount = product.original_price && product.second_hand_price
    ? Math.round(((parseFloat(product.original_price) - parseFloat(product.second_hand_price)) / parseFloat(product.original_price)) * 100)
    : 0;

  return (
    <>
      <div className="product-detail-wrapper">
        <div className="product-detail-left">
          <img
            src={product.image_url || `https://ladyfirstme.pythonanywhere.com/media/${product.image}`}
            alt={product.title}
          />
        </div>

        <div className="product-detail-right">
          <h1>{product.title}</h1>
          <div className="price-row">
            <span className="price">฿{product.second_hand_price}</span>
            <span className="original-price">฿{product.original_price}</span>
            {discount > 0 && <span className="discount">-{discount}%</span>}
          </div>

          <div className="detail-line"><strong>Brand:</strong> {product.brand_name || 'No Brand'}</div>
          <div className="detail-line"><strong>Condition:</strong> {product.condition}</div>
          <div className="detail-line"><strong>Size:</strong> {product.size}</div>
          <div className="detail-line"><strong>Color:</strong> {product.color}</div>

          <div className="product-description">
            <h4>Product Description</h4>
            <p>{product.description}</p>
          </div>

          <div className="product-detail-buttons">
            <button className="btn-outline-black">Buy Now</button>
            <button className="btn-filled-black">Add to Cart</button>
          </div>
        </div>
      </div>

      {/* ✅ Store Card Section */}
      <div className="store-card">
        <div className="store-left">
          <div className="store-logo">B</div>
          <div className="store-info">
            <h3>Big fashion168</h3>
            <div className="store-tags">
              <span className="tag">Store rating 95%</span>
              <span className="tag">Recommended shop</span>
              <span className="tag">Fast response: 1 min</span>
            </div>
          </div>
        </div>
        <div className="store-actions">
          <button className="btn-store-outline">💬 Chat</button>
          <button className="btn-store-outline">🏪 Go to Store</button>
        </div>
      </div>

    </>
  );
}

export default ProductDetail;
