import React, { useEffect, useState, useRef } from 'react';
import './LandingProductShowcase.css';

function LandingProductShowcase() {
  const [products, setProducts] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          'https://ladyfirstme.pythonanywhere.com/api/auth/products/?limit=30'
        );
        const data = await response.json();

        const latestFirst = (data.products || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        const sortedByPrice = latestFirst.sort(
          (a, b) => parseFloat(a.second_hand_price) - parseFloat(b.second_hand_price)
        );

        // Limit to first 10 newest & cheapest products
        setProducts(sortedByPrice.slice(0, 10));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  return (
    <div className="product-showcase-container">
      <div className="product-showcase-header">
        <div className="product-tabs">
          <button className="product-tab active">Latest Deals</button>
        </div>
        <a href="/products?sort_by=low_to_high" className="view-all">VIEW ALL PRODUCTS</a>
      </div>

      <div className="product-row-wrapper">
        <button className="arrow-button left" onClick={scrollLeft}>←</button>

        <div className="product-cards-row" ref={rowRef}>
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image_url} alt={product.title} />
                <div className="price">฿{product.second_hand_price}</div>
                <h4>{product.title}</h4>
                <p>{product.category_name} | {product.brand_name}</p>
              </div>
            ))
          ) : (
            <p style={{ padding: '1rem' }}>Loading products...</p>
          )}
        </div>

        <button className="arrow-button right" onClick={scrollRight}>→</button>
      </div>
    </div>
  );
}

export default LandingProductShowcase;
