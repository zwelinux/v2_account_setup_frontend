// MyProductsList.js
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./MyProductsList.css";

function MyProductsList({ refresh }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    second_hand_price: "",
  });

  const getAccessToken = () => localStorage.getItem("access_token");

  const fetchMyProducts = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError("Error: Authentication token not found.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/myproducts/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setProducts(data);
      } else {
        setError("Failed to load products. Ensure you are logged in.");
      }
    } catch (err) {
      setError("Error: " + err.message);
    }
  }, []);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts, refresh]);

  const handleDelete = async (id) => {
    const token = getAccessToken();
    if (!token) {
      setError("Error: Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/auth/products/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } else if (response.status === 403) {
        setError("Forbidden: You are not allowed to delete this product.");
      } else {
        setError(`Delete failed with status ${response.status}.`);
      }
    } catch (error) {
      setError("Error deleting product: " + error.message);
    }
  };

  const openEditForm = (product) => {
    setEditProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      second_hand_price: product.second_hand_price,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = async () => {
    if (!editProduct) return;
    const token = getAccessToken();
    if (!token) {
      setError("Error: Authentication token not found.");
      return;
    }

    try {
      const updatedData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        second_hand_price: parseFloat(formData.second_hand_price) || 0,
      };

      const response = await fetch(`http://localhost:8000/api/auth/products/${editProduct.id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
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
        setError(`Update failed: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      setError("Error updating product: " + error.message);
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
                  src={product.image.startsWith("http") ? product.image : `http://localhost:8000/media/${product.image}`}
                  alt={product.title}
                />
                <div className="card-body">
                  <h3>{product.title}</h3>
                  <p className="price">฿{product.second_hand_price}</p>
                  <p>{product.category_name} | {product.brand_name}</p>
                </div>

              </Link>

              <div className="icon-buttons">
                <FaEdit className="icon edit-icon" onClick={() => openEditForm(product)} />
                <FaTrash className="icon delete-icon" onClick={() => handleDelete(product.id)} />
              </div>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {editProduct && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Product</h3>
            <label>Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} />

            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>

            <label>Price:</label>
            <input
              type="number"
              name="second_hand_price"
              value={formData.second_hand_price}
              onChange={handleChange}
            />

            <button onClick={handleEdit} className="save-btn">Save</button>
            <button onClick={() => setEditProduct(null)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProductsList;