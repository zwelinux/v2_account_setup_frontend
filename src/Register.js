import React, { useState } from 'react';
import countries from './countries';
import './Register.css';

function Register({ onRegisterSuccess, toggleToLogin }) {
  // Track the current step (1, 2, or 3)
  const [step, setStep] = useState(1);
  
  // All form data stored in one state object
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    country: '',
    province: '',
    city: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');
  
  // Local state for cascading dropdown selections
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  
  // Handle generic input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };
  
  // For country selection
  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setSelectedCountry(countryName);
    setFormData({ ...formData, country: countryName, province: '', city: '' });
    setSelectedProvince('');
  };
  
  // For province selection
  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    setFormData({ ...formData, province: provinceName, city: '' });
  };
  
  // For city selection
  const handleCityChange = (e) => {
    setFormData({ ...formData, city: e.target.value });
  };
  
  // Proceed to next step (with validation for current step)
  const nextStep = () => {
    // Step 1 validation: required text fields and matching passwords.
    if (step === 1) {
      if (!formData.username || !formData.email || !formData.password || !formData.confirm_password) {
        setMessage("Please fill in all fields.");
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setMessage("Passwords do not match.");
        return;
      }
    }
    // Step 3 validation: address fields must be selected.
    if (step === 3) {
      if (!formData.country || !formData.province || !formData.city) {
        setMessage("Please fill in your address.");
        return;
      }
    }
    setMessage('');
    setStep(step + 1);
  };
  
  // Go back to the previous step
  const prevStep = () => {
    setMessage('');
    if (step > 1) setStep(step - 1);
  };
  
  // Final submission on step 3
  const handleRegister = async (e) => {
    e.preventDefault();
    // Final check for address fields
    if (!formData.country || !formData.province || !formData.city) {
      setMessage("Please fill in your address.");
      return;
    }
    // Prepare form data for multipart/form-data upload
    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }
    if (profilePicture) {
      data.append('profile_picture', profilePicture);
    }
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        body: data
      });
      const json = await response.json();
      if (response.ok) {
        setMessage("Account created successfully!");
        // After a short delay, switch to login view
        setTimeout(() => {
          onRegisterSuccess && onRegisterSuccess();
        }, 2000);
      } else {
        setMessage(json.error || JSON.stringify(json));
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };
  
  // For cascading address dropdowns
  const countryObj = countries.find(c => c.name === selectedCountry);
  const provinces = countryObj ? countryObj.provinces : [];
  const provinceObj = provinces.find(p => p.name === selectedProvince);
  const cities = provinceObj ? provinceObj.cities : [];
  
  return (
    <div className="register-container">
      <form
        className="register-form"
        onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); nextStep(); }}
        encType="multipart/form-data"
      >
        <h2>Create Account (Step {step} of 3)</h2>
        
        {step === 1 && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </>
        )}
        
        {step === 2 && (
          <>
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
            />
            <label>Profile Picture:</label>
            <input
              type="file"
              name="profile_picture"
              onChange={handleFileChange}
              accept="image/*"
            />
          </>
        )}
        
        {step === 3 && (
          <>
            <label>Country:</label>
            <select
              name="country"
              value={selectedCountry}
              onChange={handleCountryChange}
              required
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            <label>Province:</label>
            <select
              name="province"
              value={formData.province}
              onChange={handleProvinceChange}
              required
              disabled={!selectedCountry}
            >
              <option value="">Select a province</option>
              {provinces.map((province) => (
                <option key={province.name} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            <label>City:</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleCityChange}
              required
              disabled={!selectedProvince}
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </>
        )}
        
        <div className="button-group">
          {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
          {step < 3 && <button type="button" onClick={nextStep}>Next</button>}
          {step === 3 && <button type="submit">Register</button>}
        </div>
        
        {message && <p className="message">{message}</p>}
        
        {step === 1 && (
          <p className="toggle-text">
            Already have an account?{" "}
            <span className="toggle-link" onClick={toggleToLogin}>
              Login here.
            </span>
          </p>
        )}
      </form>
    </div>
  );
}

export default Register;
