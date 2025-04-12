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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };
  
  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/brands/');
      const data = await response.json();
      setBrands(data);
    } catch (err) {
      console.error('Failed to load brands:', err);
    }
  };

  const fetchProducts = async (page = 1, customFilters = {}) => {
    const queryParams = new URLSearchParams({
      page,
      limit: 20,
      ...(sortBy && { sort_by: sortBy }),
      ...(priceRange && { price_range: priceRange }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(selectedBrand && { brand: selectedBrand }),
      ...(searchTerm && { keyword: searchTerm }),
      ...customFilters,
    });
  
    try {
      const response = await fetch(
        `http://localhost:8000/api/auth/products/?${queryParams.toString()}`,
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
    fetchCategories();
    fetchBrands();
  }, []);

  // Construct a full URL for the image
  const getImageUrl = (product) => {
    // If your serializer returns an absolute URL in `image_url`, use that
    if (product.image_url) return product.image_url;
    // Otherwise, assume the image field is a relative path under /media/
    return `http://localhost:8000/media/${product.image}`;
  };

  return (
    <div className="product-list-container">
      <h2>All Products</h2>

     

      <div className="filter-bar">

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

        <select value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>

        <select value={selectedBrand} onChange={(e) => setSelectedBrand(Number(e.target.value))}>
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.title}
            </option>
          ))}
        </select>
        
        <button onClick={() => fetchProducts(1)} className='apply'>Apply</button>
        <button
          style={{ backgroundColor: '#ccc', marginLeft: '0rem' }}
          className='reset'
          onClick={() => {
            setSortBy('');
            setPriceRange('');
            setSelectedCategory('');
            setSelectedBrand('');
            fetchProducts(1, {
              sort_by: '',
              price_range: '',
              category: '',
              brand: '',
            });
          }}
        >
          Reset
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') fetchProducts(1, { keyword: searchTerm });
          }}
        />
        <button onClick={() => fetchProducts(1, { keyword: searchTerm })}>Search</button>
      </div>


      {error && <p className="error-message">{error}</p>}
      <div className="product-cards">
      {products.length > 0 ? (
        products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`} className="product-link">
            <div className="product-card">
              <img src={product.image_url} alt={product.title} />
              <div className="price">฿{product.second_hand_price}</div>
              <h4>{product.title}</h4>
              <p>{product.category_name} | {product.brand_name}</p>
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