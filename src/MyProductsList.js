import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icons
import './MyProductsList.css';

/**
 * Helper function to get the CSRF token from browser cookies.
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function MyProductsList({ refresh }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    second_hand_price: ''
  });

  // Fetch the user's products
  const fetchMyProducts = async () => {
    try {
      const response = await fetch('https://ladyfirst.pythonanywhere.com/api/auth/myproducts/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

  // Delete a product
  const handleDelete = async (id) => {
    try {
      const csrftoken = getCookie('csrftoken');

      const response = await fetch(`https://ladyfirst.pythonanywhere.com/api/auth/products/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        credentials: 'include'
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } else if (response.status === 403) {
        setError('Forbidden: You are not allowed to delete this product.');
      } else {
        setError(`Delete failed with status ${response.status}.`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error deleting product: ' + error.message);
    }
  };

  // Open the edit form with existing product details
  const openEditForm = (product) => {
    setEditProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      second_hand_price: product.second_hand_price
    });
  };

  // Handle input changes in the edit form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Update product details (PUT request)
  const handleEdit = async () => {
    if (!editProduct) return;
  
    try {
      const csrftoken = getCookie('csrftoken');
  
      const updatedData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        second_hand_price: parseFloat(formData.second_hand_price) || 0,
      };
  
      console.log('Sending update request:', updatedData);
  
      const response = await fetch(`https://ladyfirst.pythonanywhere.com/api/auth/products/${editProduct.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });
  
      if (response.ok) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editProduct.id ? { ...product, ...updatedData } : product
          )
        );
        setEditProduct(null);
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        setError(`Update failed: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Error updating product: ' + error.message);
    }
  };
  

  return (
    <div className="my-products-container">
      <h2>My Uploaded Products</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="product-cards">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="product-card" key={product.id}>
              <Link to={`/products/${product.id}`} className="product-link">
                <img
                  src={
                    product.image.startsWith('http')
                      ? product.image
                      : `https://ladyfirst.pythonanywhere.com/media/${product.image}`
                  }
                  alt={product.title}
                />
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <p>Price: ${product.second_hand_price}</p>
              </Link>

              <div className="icon-buttons">
                {/* Edit Icon */}
                <FaEdit className="icon edit-icon" onClick={() => openEditForm(product)} />
                {/* Delete Icon */}
                <FaTrash className="icon delete-icon" onClick={() => handleDelete(product.id)} />
              </div>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Product</h3>
            <label>Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} />
            
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
            
            <label>Price:</label>
            <input type="number" name="second_hand_price" value={formData.second_hand_price} onChange={handleChange} />

            <button onClick={handleEdit} className="save-btn">Save</button>
            <button onClick={() => setEditProduct(null)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProductsList;
