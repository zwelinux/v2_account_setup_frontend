// src/UserProfile.js
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './UserProfile.css';

function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://ladyfirstme.pythonanywhere.com/api/auth'
  : 'http://localhost:8000/api/auth';

  // `${API_BASE_URL}

  // Fetch public profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile/${username}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Removed credentials: 'include' to allow public access
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          setError('Profile not found.');
        }
      } catch (err) {
        setError('Error fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Fetch products created by this user
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile/${username}/products/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Removed credentials: 'include' to allow public access
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching user products:', err);
      }
    };

    fetchProducts();
  }, [username]);

  // Show loading state
  if (loading) return <p className="loading-message">Loading profile...</p>;

  // Show error message if profile not found
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="user-profile">
      <h2>{profile.username}'s Profile</h2>

      <div className="profile-info">
        {/* Profile Image */}
        <img
          className="profile-picture"
          src={profile.profile_picture 
            ? (profile.profile_picture.startsWith('http') 
              ? profile.profile_picture 
              : `${API_BASE_URL}/media/${profile.profile_picture}`)
            : `${API_BASE_URL}/media/default_profile.jpg`}
          alt={`${profile.username}'s profile`}
        />

        {/* User Information */}
        <div className="profile-details">
          <p><strong>Email:</strong> {profile.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> {profile.phone_number || 'Not provided'}</p>
          <p><strong>Location:</strong> {profile.city}, {profile.province}, {profile.country}</p>
        </div>
      </div>

      {/* User Products */}
      <h3>Products Uploaded by {profile.username}</h3>
      <div className="product-cards">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="product-card" key={product.id}>
              <Link to={`/products/${product.id}`} className="product-link">
                <img
                  className="product-image"
                  src={product.image_url ? product.image_url : `${API_BASE_URL}/media/${product.image}`}
                  alt={product.title}
                />
                <h4>{product.title}</h4>
                <p>Price: ${product.second_hand_price}</p>
                <p>{product.category_name} | {product.brand_name}</p>
              </Link>
            </div>
          ))
        ) : (
          <p className="no-products-message">No products found.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;