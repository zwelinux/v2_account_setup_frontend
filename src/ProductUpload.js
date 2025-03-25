import React, { useState, useEffect } from 'react';
import './ProductUpload.css';

function ProductUpload({ onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [secondHandPrice, setSecondHandPrice] = useState('');
  const [category, setCategory] = useState(''); // PK value
  const [brand, setBrand] = useState('');       // PK value
  const [condition, setCondition] = useState('gently_used');
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('white');
  const [image, setImage] = useState(null);
  const [authDoc, setAuthDoc] = useState(null);
  const [message, setMessage] = useState('');

  // Arrays for dropdown options
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Fetch categories and brands on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const catRes = await fetch('https://ladyfirstme.pythonanywhere.com/api/auth/categories/');
        const catData = await catRes.json();
        setCategories(catData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
      try {
        const brandRes = await fetch('https://ladyfirstme.pythonanywhere.com/api/auth/brands/');
        const brandData = await brandRes.json();
        setBrands(brandData);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOriginalPrice('');
    setSecondHandPrice('');
    setCategory('');
    setBrand('');
    setCondition('gently_used');
    setSize('M');
    setColor('white');
    setImage(null);
    setAuthDoc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
  
    const data = new FormData();
    data.append("title", title);
    data.append("description", description);
    data.append("original_price", originalPrice);
    data.append("second_hand_price", secondHandPrice);
    data.append("category", category); // PK value
    if (brand) data.append("brand", brand); // PK value
    data.append("condition", condition);
    data.append("size", size);
    data.append("color", color);
    if (image) data.append("image", image);
    if (authDoc) data.append("authenticity_document", authDoc);
  
    // ✅ Get access token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("Error: No authentication token found.");
      return;
    }
  
    try {
      const response = await fetch("https://ladyfirstme.pythonanywhere.com/api/auth/products/", {
        method: "POST",
        body: data,
        headers: {
          "Authorization": `Bearer ${token}`,  // ✅ Include access token
        },
      });
  
      const json = await response.json();
      if (response.ok) {
        setMessage("Product uploaded successfully!");
        resetForm();
        onUploadSuccess && onUploadSuccess();
      } else {
        setMessage("Error: " + JSON.stringify(json));
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="product-upload-container">
      <h2>Upload Your Product</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input 
          type="text" 
          placeholder="Product Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />
        <textarea 
          placeholder="Description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input 
          type="number" 
          step="0.01"
          placeholder="Original Price" 
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
        />
        <input 
          type="number" 
          step="0.01"
          placeholder="Second Hand Price" 
          value={secondHandPrice}
          onChange={(e) => setSecondHandPrice(e.target.value)}
          required 
        />
        <label>Category:</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
        <label>Brand (optional):</label>
        <select 
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="">Select a brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
        <select 
          value={condition} 
          onChange={(e) => setCondition(e.target.value)} 
          required
        >
          <option value="brand_new">Brand New</option>
          <option value="new">New</option>
          <option value="like_new">Like New</option>
          <option value="gently_used">Gently Used</option>
          <option value="worn">Worn</option>
          <option value="heavily_used">Heavily Used</option>
        </select>
        <select 
          value={size} 
          onChange={(e) => setSize(e.target.value)} 
          required
        >
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
          <option value="XL">X-Large</option>
          <option value="XXL">XX-Large</option>
          <option value="custom">Custom</option>
        </select>
        <select 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          required
        >
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
          <option value="orange">Orange</option>
          <option value="purple">Purple</option>
          <option value="pink">Pink</option>
          <option value="brown">Brown</option>
          <option value="black">Black</option>
          <option value="white">White</option>
          <option value="gray">Gray</option>
          <option value="teal">Teal</option>
          <option value="cyan">Cyan</option>
          <option value="magenta">Magenta</option>
        </select>
        <label>Product Image:</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <label>Authenticity Document (optional):</label>
        <input 
          type="file" 
          accept="application/pdf,image/*"
          onChange={(e) => setAuthDoc(e.target.files[0])}
        />
        <button type="submit">Upload Product</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default ProductUpload;
