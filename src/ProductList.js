// src/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const fetchProducts = async (page = 1) => {
    const queryParams = new URLSearchParams({
      page,
      limit: 20,
      ...(sortBy && { sort_by: sortBy }),
      ...(priceRange && { price_range: priceRange }),
    });
  
    try {
      const response = await fetch(
        `https://ladyfirstme.pythonanywhere.com/api/auth/products/?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setCurrentPage(data.current_page);
        setTotalPages(data.total_pages);
      } else {
        setError('Failed to load products.');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchProducts(1);
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

      <div className="filters">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort By</option>
          <option value="a_z">A → Z</option>
          <option value="z_a">Z → A</option>
          <option value="low_to_high">Price: Low to High</option>
          <option value="high_to_low">Price: High to Low</option>
          <option value="date-acs">Oldest First</option>
          <option value="date-desc">Latest First</option>
        </select>

        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="">Price Range</option>
          <option value="0_50">$0 - $50</option>
          <option value="50_100">$50 - $100</option>
          <option value="100_200">$100 - $200</option>
          <option value="200_99999">$200+</option>
        </select>

        <button onClick={() => fetchProducts(1)}>Apply</button>
      </div>

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

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => fetchProducts(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
