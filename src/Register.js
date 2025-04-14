// src/Register.js
import React, { useState, useEffect, useCallback } from 'react';
import countries from './countries';
import './Register.css';

import { FaPhone, FaWeight, FaShoePrints, FaEnvelope } from 'react-icons/fa';

function Register({ onRegisterSuccess, toggleToLogin }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isEmailMode, setIsEmailMode] = useState(true); // Toggle between email and phone

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    country: '',
    province: '',
    city: '',
    postal_code: '',
    full_address: '',
    weight_kg: '',
    height_cm: '',
    chest_bust: '',
    waist: '',
    hip: '',
    inseam: '',
    foot_size_us: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  const [weightUnit, setWeightUnit] = useState('kg');
  const [weightInput, setWeightInput] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [heightCmInput, setHeightCmInput] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [footSizeUnit, setFootSizeUnit] = useState('us');
  const [footSizeInput, setFootSizeInput] = useState('');
  const [countryCode, setCountryCode] = useState('+95');

  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://ladyfirstme.pythonanywhere.com/api/auth'
    : 'http://localhost:8000/api/auth';

  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'username') {
      if (value.length < 3) {
        setErrors({ ...errors, username: 'Username must be at least 3 characters.' });
      } else {
        setErrors({ ...errors, username: '' });
      }
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setErrors({ ...errors, email: 'Please enter a valid email address.' });
      } else {
        setErrors({ ...errors, email: '' });
      }
    }

    if (name === 'password') {
      if (value.length < 6) {
        setErrors({ ...errors, password: 'Password must be at least 6 characters.' });
      } else {
        setErrors({ ...errors, password: '' });
      }
    }

    if (name === 'confirm_password') {
      if (value !== formData.password) {
        setErrors({ ...errors, confirm_password: 'Passwords do not match.' });
      } else {
        setErrors({ ...errors, confirm_password: '' });
      }
    }

    if (name === 'postal_code') {
      if (!value) {
        setErrors({ ...errors, postal_code: 'Postal code is required.' });
      } else {
        setErrors({ ...errors, postal_code: '' });
      }
    }
  };

  const handlePhoneNumberChange = (e) => {
    const phoneNumber = e.target.value;
    if (phoneNumber && !/^\d*$/.test(phoneNumber)) {
      setErrors({ ...errors, phone_number: 'Phone number must contain only digits.' });
      setMessage('Phone number must contain only digits.');
      return;
    }
    setFormData({ ...formData, phone_number: `${countryCode}${phoneNumber}` });
    setErrors({ ...errors, phone_number: '' });
    setMessage('');
  };

  const handleCountryCodeChange = (e) => {
    const newCountryCode = e.target.value;
    setCountryCode(newCountryCode);
    const phoneNumber = formData.phone_number.replace(/^\+\d+/, '');
    setFormData({ ...formData, phone_number: `${newCountryCode}${phoneNumber}` });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setSelectedCountry(countryName);
    setFormData({ ...formData, country: countryName, province: '', city: '' });
    setSelectedProvince('');
    const country = countries.find(c => c.name === countryName);
    if (country) {
      setCountryCode(country.phone);
    }
    if (!countryName) {
      setErrors({ ...errors, country: 'Country is required.' });
    } else {
      setErrors({ ...errors, country: '' });
    }
  };

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    setFormData({ ...formData, province: provinceName, city: '' });
    if (!provinceName) {
      setErrors({ ...errors, province: 'Province is required.' });
    } else {
      setErrors({ ...errors, province: '' });
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFormData({ ...formData, city: cityName });
    if (!cityName) {
      setErrors({ ...errors, city: 'City is required.' });
    } else {
      setErrors({ ...errors, city: '' });
    }
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    setWeightInput(value);
    if (value) {
      const weight = parseFloat(value);
      if (isNaN(weight)) {
        setFormData({ ...formData, weight_kg: '' });
        return;
      }
      if (weightUnit === 'kg') {
        setFormData({ ...formData, weight_kg: weight });
      } else {
        setFormData({ ...formData, weight_kg: weight * 0.453592 });
      }
    } else {
      setFormData({ ...formData, weight_kg: '' });
    }
  };

  const handleHeightChange = useCallback(() => {
    let newHeightCm;
    if (heightUnit === 'cm') {
      const height = parseFloat(heightCmInput);
      newHeightCm = isNaN(height) ? '' : height;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const totalCm = (ft * 30.48) + (inches * 2.54);
      newHeightCm = totalCm || '';
    }
    if (newHeightCm !== formData.height_cm) {
      setFormData(prevFormData => ({ ...prevFormData, height_cm: newHeightCm }));
    }
  }, [heightUnit, heightCmInput, heightFt, heightIn, formData.height_cm]);

  const handleFootSizeChange = (e) => {
    const value = e.target.value;
    setFootSizeInput(value);
    if (value) {
      const size = parseFloat(value);
      if (isNaN(size)) {
        setFormData({ ...formData, foot_size_us: '' });
        return;
      }
      if (footSizeUnit === 'us') {
        setFormData({ ...formData, foot_size_us: size });
      } else {
        setFormData({ ...formData, foot_size_us: size + 0.5 });
      }
    } else {
      setFormData({ ...formData, foot_size_us: '' });
    }
  };

  useEffect(() => {
    handleHeightChange();
  }, [heightCmInput, heightFt, heightIn, heightUnit, handleHeightChange]);

  const nextStep = () => {
    let stepErrors = {};

    if (step === 1) {
      if (!formData.username) {
        stepErrors.username = 'Username is required.';
      } else if (formData.username.length < 3) {
        stepErrors.username = 'Username must be at least 3 characters.';
      }
      if (isEmailMode) {
        if (!formData.email) {
          stepErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          stepErrors.email = 'Please enter a valid email address.';
        }
      } else {
        const phoneNumber = formData.phone_number.replace(countryCode, '');
        if (!phoneNumber) {
          stepErrors.phone_number = 'Phone number is required.';
        } else if (phoneNumber.length < 6 || phoneNumber.length > 15) {
          stepErrors.phone_number = 'Phone number must be between 6 and 15 digits.';
        }
      }
      if (!formData.password) {
        stepErrors.password = 'Password is required.';
      } else if (formData.password.length < 6) {
        stepErrors.password = 'Password must be at least 6 characters.';
      }
      if (!formData.confirm_password) {
        stepErrors.confirm_password = 'Please confirm your password.';
      } else if (formData.password !== formData.confirm_password) {
        stepErrors.confirm_password = 'Passwords do not match.';
      }
    }

    if (step === 4) {
      if (!formData.country) stepErrors.country = 'Country is required.';
      if (!formData.province) stepErrors.province = 'Province is required.';
      if (!formData.city) stepErrors.city = 'City is required.';
      if (!formData.postal_code) stepErrors.postal_code = 'Postal code is required.';
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setMessage("Please correct the errors above.");
      return;
    }

    setErrors({});
    setMessage('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setMessage('');
    setErrors({});
    if (step > 1) setStep(step - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    let submissionErrors = {};
    if (!formData.email && !formData.phone_number) {
      setMessage("Either email or phone number must be provided.");
      return;
    }
    if (!formData.country) submissionErrors.country = 'Country is required.';
    if (!formData.province) submissionErrors.province = 'Province is required.';
    if (!formData.city) submissionErrors.city = 'City is required.';
    if (!formData.postal_code) submissionErrors.postal_code = 'Postal code is required.';
  
    if (Object.keys(submissionErrors).length > 0) {
      setErrors(submissionErrors);
      setMessage("Please fill in your complete address, including postal code.");
      return;
    }
  
    const data = new FormData();
    for (let key in formData) {
      // Only append fields that have a non-empty value
      if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    }
    if (profilePicture) {
      data.append('profile_picture', profilePicture);
    }
  
    console.log("FormData being sent:");
    for (let [key, value] of data.entries()) {
      console.log(`${key}: ${value}`);
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
      });
  
      const json = await response.json();
  
      if (response.ok) {
        localStorage.setItem('access_token', json.access);
        localStorage.setItem('refresh_token', json.refresh);
        setMessage("Account created successfully!");
        fetchUserData(json.access);
        setTimeout(() => {
          onRegisterSuccess && onRegisterSuccess();
        }, 2000);
      } else {
        if (json.phone_number) {
          setErrors({ ...errors, phone_number: json.phone_number });
          setMessage(`Phone number error: ${json.phone_number}`);
        } else if (json.email) {
          setErrors({ ...errors, email: json.email });
          setMessage(`Email error: ${json.email}`);
        } else {
          setMessage(json.detail || JSON.stringify(json));
        }
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("User data:", userData);
      } else {
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user:", error.message);
    }
  };

  const countryObj = countries.find(c => c.name === selectedCountry);
  const provinces = countryObj ? countryObj.provinces : [];
  const provinceObj = provinces.find(p => p.name === selectedProvince);
  const cities = provinceObj ? provinceObj.cities : [];

  return (
    <div className="register-container">
      <form
        className="register-form"
        onSubmit={step === 4 ? handleRegister : (e) => { e.preventDefault(); nextStep(); }}
        encType="multipart/form-data"
      >
        <h2>Create Account (Step {step} of 4)</h2>

        {step === 1 && (
          <div className="form-step">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className={errors.username ? 'input-error' : ''}
              />
              {errors.username && <p className="error-text">{errors.username}</p>}
            </div>
            <div className="login-toggle">
              <button
                type="button"
                className={`toggle-btn ${isEmailMode ? 'active' : ''}`}
                onClick={() => setIsEmailMode(true)}
              >
                Email
              </button>
              <button
                type="button"
                className={`toggle-btn ${!isEmailMode ? 'active' : ''}`}
                onClick={() => setIsEmailMode(false)}
              >
                Phone Number
              </button>
            </div>
            {isEmailMode ? (
              <div className="input-group">
                <label htmlFor="email">
                  <FaEnvelope className="input-icon" /> Email
                  <span className="helper-text"> (e.g., user@example.com)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
            ) : (
              <div className="input-group phone-input-group">
                <label htmlFor="phone_number">
                  <FaPhone className="input-icon" /> Phone Number
                  <span className="helper-text"> (e.g., 123456789)</span>
                  <span className="tooltip">Must be 6-15 digits</span>
                </label>
                <div className="phone-input-wrapper">
                  <select value={countryCode} onChange={handleCountryCodeChange}>
                    {sortedCountries.map((country) => (
                      <option key={country.code} value={country.phone}>
                        {country.phone} ({country.name})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    placeholder="Enter phone number"
                    value={formData.phone_number.replace(countryCode, '')}
                    onChange={handlePhoneNumberChange}
                    required
                    className={errors.phone_number ? 'input-error' : ''}
                  />
                </div>
                {errors.phone_number && <p className="error-text">{errors.phone_number}</p>}
              </div>
            )}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="confirm_password">Confirm Password</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                className={errors.confirm_password ? 'input-error' : ''}
              />
              {errors.confirm_password && <p className="error-text">{errors.confirm_password}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <div className="input-group">
              <label htmlFor="profile_picture">Profile Picture</label>
              <input
                type="file"
                id="profile_picture"
                name="profile_picture"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <div className="input-group">
              <label htmlFor="weight">
                <FaWeight className="input-icon" /> Weight
                <span className="helper-text"> (optional)</span>
              </label>
              <div className="unit-input-wrapper">
                <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
                <input
                  type="number"
                  id="weight"
                  placeholder={`Enter weight in ${weightUnit}`}
                  value={weightInput}
                  onChange={handleWeightChange}
                  step="0.1"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="height">Height <span className="helper-text">(optional)</span></label>
              <div className="unit-input-wrapper">
                <select value={heightUnit} onChange={(e) => setHeightUnit(e.target.value)}>
                  <option value="cm">cm</option>
                  <option value="ft-in">ft/in</option>
                </select>
                {heightUnit === 'cm' ? (
                  <input
                    type="number"
                    id="height"
                    placeholder="Enter height in cm"
                    value={heightCmInput}
                    onChange={(e) => setHeightCmInput(e.target.value)}
                    step="0.1"
                  />
                ) : (
                  <div className="height-ft-in">
                    <input
                      type="number"
                      placeholder="Feet"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      step="1"
                    />
                    <input
                      type="number"
                      placeholder="Inches"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      step="0.1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="chest_bust">Chest/Bust (cm) <span className="helper-text">(optional)</span></label>
              <input
                type="number"
                id="chest_bust"
                name="chest_bust"
                placeholder="Enter chest/bust in cm"
                value={formData.chest_bust}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="input-group">
              <label htmlFor="waist">Waist (cm) <span className="helper-text">(optional)</span></label>
              <input
                type="number"
                id="waist"
                name="waist"
                placeholder="Enter waist in cm"
                value={formData.waist}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="input-group">
              <label htmlFor="hip">Hip (cm) <span className="helper-text">(optional)</span></label>
              <input
                type="number"
                id="hip"
                name="hip"
                placeholder="Enter hip in cm"
                value={formData.hip}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="input-group">
              <label htmlFor="inseam">Inseam (cm) <span className="helper-text">(optional)</span></label>
              <input
                type="number"
                id="inseam"
                name="inseam"
                placeholder="Enter inseam in cm"
                value={formData.inseam}
                onChange={handleChange}
                step="0.1"
              />
            </div>

            <div className="input-group">
              <label htmlFor="foot_size">
                <FaShoePrints className="input-icon" /> Foot Size
                <span className="helper-text"> (optional)</span>
              </label>
              <div className="unit-input-wrapper">
                <select value={footSizeUnit} onChange={(e) => setFootSizeUnit(e.target.value)}>
                  <option value="us">US</option>
                  <option value="uk">UK</option>
                </select>
                <input
                  type="number"
                  id="foot_size"
                  placeholder={`Enter foot size in ${footSizeUnit}`}
                  value={footSizeInput}
                  onChange={handleFootSizeChange}
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-step">
            <div className="input-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={selectedCountry}
                onChange={handleCountryChange}
                required
                className={errors.country ? 'input-error' : ''}
              >
                <option value="">Select a country</option>
                {sortedCountries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && <p className="error-text">{errors.country}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="province">Province</label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleProvinceChange}
                required
                disabled={!selectedCountry}
                className={errors.province ? 'input-error' : ''}
              >
                <option value="">Select a province</option>
                {provinces.map((province) => (
                  <option key={province.name} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
              {errors.province && <p className="error-text">{errors.province}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="city">City</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                required
                disabled={!selectedProvince}
                className={errors.city ? 'input-error' : ''}
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="postal_code">Postal Code</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                placeholder="Enter postal code"
                value={formData.postal_code}
                onChange={handleChange}
                required
                className={errors.postal_code ? 'input-error' : ''}
              />
              {errors.postal_code && <p className="error-text">{errors.postal_code}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="full_address">Full Address <span className="helper-text">(optional)</span></label>
              <textarea
                id="full_address"
                name="full_address"
                placeholder="Enter your full address (e.g., 123 Main Street, Apt 4B)"
                value={formData.full_address}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>
        )}

        <div className="button-group">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              Back
            </button>
          )}
          {step < 4 && (
            <button type="button" onClick={nextStep} className="btn-primary">
              Next
            </button>
          )}
          {step === 4 && (
            <button type="submit" className="btn-primary">
              Register
            </button>
          )}
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