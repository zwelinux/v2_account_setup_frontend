// src/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './UserProfile.css';

function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  // Fetch public profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`http://localhost:8000/api/auth/profile/${username}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          setError('Failed to load profile.');
        }
      } catch (err) {
        setError('Error: ' + err.message);
      }
    }
    fetchProfile();
  }, [username]);

  // Fetch products created by this user
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`http://localhost:8000/api/auth/profile/${username}/products/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to load products for user.');
        }
      } catch (err) {
        console.error('Error fetching user products: ' + err.message);
      }
    }
    fetchProducts();
  }, [username]);

  if (error) return <p className="error-message">{error}</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="user-profile">
      <h2>{profile.username}'s Profile</h2>
      {profile.profile_picture ? (
        <img
          src={profile.profile_picture.startsWith('http') 
              ? profile.profile_picture 
              : `http://localhost:8000/media/${profile.profile_picture}`}
          alt={profile.username}
        />
      ) : (
        <img src="http://localhost:8000/media/default_profile.jpg" alt="default" />
      )}
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone_number}</p>
      <p>Address: {profile.city}, {profile.province}, {profile.country}</p>

      <h3>Products Uploaded by {profile.username}</h3>
      <div className="product-cards">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={product.image_url ? product.image_url : `http://localhost:8000/media/${product.image}`}
                alt={product.title}
              />
              <h4>{product.title}</h4>
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

export default UserProfile;
