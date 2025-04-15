// src/AccountSetup.js
import React, { useState, useEffect, useCallback } from 'react';
import countries from './countries';
import './Register.css';
import { FaUser, FaPhone, FaEnvelope, FaWeight, FaShoePrints, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';

function AccountSetup({ onSetupComplete, user }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(user.country || '');
  const [selectedProvince, setSelectedProvince] = useState(user.province || '');
  const [countryCode, setCountryCode] = useState('');

  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    phone_number: user.phone_number ? user.phone_number.replace(/^\+\d+/, '') : '', // Preserve phone number
    country_code: '',
    country: user.country || '',
    province: user.province || '',
    city: user.city || '',
    postal_code: user.postal_code || '',
    full_address: user.full_address || '',
    weight_kg: user.weight_kg || '',
    height_cm: user.height_cm || '',
    chest_bust: user.chest_bust || '',
    waist: user.waist || '',
    hip: user.hip || '',
    inseam: user.inseam || '',
    foot_size_us: user.foot_size_us || '',
  });

  const [weightUnit, setWeightUnit] = useState('kg');
  const [weightInput, setWeightInput] = useState(user.weight_kg || '');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [heightCmInput, setHeightCmInput] = useState(user.height_cm || '');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [footSizeUnit, setFootSizeUnit] = useState('us');
  const [footSizeInput, setFootSizeInput] = useState(user.foot_size_us || '');

  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://ladyfirstme.pythonanywhere.com/api/auth'
    : 'http://localhost:8000/api/auth';

  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  // Get provinces for selected country
  const getProvinces = useCallback(() => {
    const country = countries.find((c) => c.name === selectedCountry);
    return country ? country.provinces : [];
  }, [selectedCountry]);

  // Get cities for selected province
  const getCities = useCallback(() => {
    const country = countries.find((c) => c.name === selectedCountry);
    if (country) {
      const province = country.provinces.find((p) => p.name === selectedProvince);
      return province ? province.cities : [];
    }
    return [];
  }, [selectedCountry, selectedProvince]);

  // Convert weight to kg
  const convertWeightToKg = useCallback((value, unit) => {
    if (!value || isNaN(value)) return '';
    return unit === 'lbs' ? parseFloat(value) * 0.453592 : parseFloat(value);
  }, []);

  // Convert height to cm
  const convertHeightToCm = useCallback((ft, inch, unit, cmValue) => {
    if (unit === 'cm') {
      return cmValue && !isNaN(cmValue) ? parseFloat(cmValue) : '';
    }
    const feet = ft && !isNaN(ft) ? parseInt(ft) : 0;
    const inches = inch && !isNaN(inch) ? parseFloat(inch) : 0;
    return (feet * 12 + inches) * 2.54;
  }, []);

  // Convert foot size between US and EU
  const convertFootSize = useCallback((value, fromUnit, toUnit) => {
    if (!value || isNaN(value)) return '';
    let usSize = parseFloat(value);
    let euSize;

    if (fromUnit === 'us' && toUnit === 'eu') {
      euSize = usSize + 31; // e.g., US 7 → EU 38
    } else if (fromUnit === 'eu' && toUnit === 'us') {
      usSize = value - 31;
      return usSize > 0 ? usSize.toFixed(1) : '';
    }

    return toUnit === 'us' ? usSize.toFixed(1) : euSize.toFixed(1);
  }, []);

  // Update height inputs when unit changes
  useEffect(() => {
    if (heightUnit === 'ft' && formData.height_cm) {
      const totalInches = parseFloat(formData.height_cm) / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = (totalInches % 12).toFixed(1);
      setHeightFt(ft);
      setHeightIn(inch);
    } else {
      setHeightCmInput(formData.height_cm || '');
    }
  }, [heightUnit, formData.height_cm]);

  // Update weight input when unit changes
  useEffect(() => {
    if (weightUnit === 'lbs' && formData.weight_kg) {
      setWeightInput((parseFloat(formData.weight_kg) / 0.453592).toFixed(2));
    } else {
      setWeightInput(formData.weight_kg || '');
    }
  }, [weightUnit, formData.weight_kg]);

  // Update foot size input when unit changes
  useEffect(() => {
    if (footSizeUnit === 'eu' && formData.foot_size_us) {
      setFootSizeInput(convertFootSize(formData.foot_size_us, 'us', 'eu'));
    } else {
      setFootSizeInput(formData.foot_size_us || '');
    }
  }, [footSizeUnit, formData.foot_size_us, convertFootSize]);

  // Set initial country code based on user country
  useEffect(() => {
    if (user.country) {
      const country = countries.find((c) => c.name === user.country);
      if (country) {
        setCountryCode(country.phone || '');
        setFormData((prev) => ({ ...prev, country_code: country.phone || '' }));
      }
    } else {
      const defaultCountry = countries.find((c) => c.code === 'MM');
      if (defaultCountry) {
        setCountryCode(defaultCountry.phone || '');
        setFormData((prev) => ({ ...prev, country_code: defaultCountry.phone || '' }));
      }
    }
  }, [user.country]);

  // Reset province and city when country changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, province: '', city: '' }));
    setSelectedProvince('');
    const country = countries.find((c) => c.name === selectedCountry);
    setCountryCode(country ? country.phone || '' : '');
    setFormData((prev) => ({ ...prev, country_code: country ? country.phone || '' : '' }));
  }, [selectedCountry]);

  // Reset city when province changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, city: '' }));
  }, [selectedProvince]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });

    if (name === 'username') {
      if (!value) {
        setErrors({ ...errors, username: 'Username is required.' });
      } else if (value.length < 3) {
        setErrors({ ...errors, username: 'Username must be at least 3 characters.' });
      }
    }

    if (name === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors({ ...errors, email: 'Please enter a valid email address.' });
      }
    }

    if (name === 'phone_number') {
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone && cleanPhone.length < 6) {
        setErrors({ ...errors, phone_number: 'Phone number must be at least 6 digits.' });
      } else if (!cleanPhone) {
        // If phone_number is cleared, preserve the original if user registered with it
        if (user.phone_number) {
          setFormData({ ...formData, phone_number: user.phone_number.replace(/^\+\d+/, '') });
          setErrors({ ...errors, phone_number: '' });
        }
      }
    }

    if (name === 'country') {
      setSelectedCountry(value);
      setFormData({ ...formData, country: value, province: '', city: '' });
    }

    if (name === 'province') {
      setSelectedProvince(value);
      setFormData({ ...formData, province: value, city: '' });
    }

    const numericFields = ['weight_kg', 'height_cm', 'chest_bust', 'waist', 'hip', 'inseam', 'foot_size_us'];
    if (numericFields.includes(name)) {
      if (value && (isNaN(value) || parseFloat(value) < 0)) {
        setErrors({ ...errors, [name]: `${name.replace('_', ' ')} must be a positive number.` });
      }
    }
  };

  const handleCountryCodeChange = (e) => {
    const value = e.target.value;
    setCountryCode(value);
    setFormData({ ...formData, country_code: value });
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    setWeightInput(value);
    setErrors((prev) => ({ ...prev, weight_kg: '' }));

    if (!value || isNaN(value) || parseFloat(value) <= 0) {
      setErrors((prev) => ({ ...prev, weight_kg: 'Weight must be a positive number.' }));
      setFormData((prev) => ({ ...prev, weight_kg: '' }));
      return;
    }

    const weightInKg = convertWeightToKg(value, weightUnit);
    setFormData((prev) => ({ ...prev, weight_kg: weightInKg }));
  };

  const handleHeightChange = (e, type) => {
    const value = e.target.value;
    if (type === 'cm') {
      setHeightCmInput(value);
      setErrors({ ...errors, height_cm: '' });
      if (value && (isNaN(value) || parseFloat(value) <= 0)) {
        setErrors({ ...errors, height_cm: 'Height must be a positive number.' });
      } else {
        setFormData({ ...formData, height_cm: value });
      }
    } else if (type === 'ft') {
      setHeightFt(value);
      setErrors({ ...errors, height_cm: '' });
      if (value && (isNaN(value) || parseInt(value) < 0)) {
        setErrors({ ...errors, height_cm: 'Height must be a positive number.' });
      } else {
        setFormData({
          ...formData,
          height_cm: convertHeightToCm(value, heightIn, heightUnit, heightCmInput),
        });
      }
    } else if (type === 'in') {
      setHeightIn(value);
      setErrors({ ...errors, height_cm: '' });
      if (value && (isNaN(value) || parseFloat(value) < 0)) {
        setErrors({ ...errors, height_cm: 'Height must be a positive number.' });
      } else {
        setFormData({
          ...formData,
          height_cm: convertHeightToCm(heightFt, value, heightUnit, heightCmInput),
        });
      }
    }
  };

  const handleFootSizeChange = (e) => {
    const value = e.target.value;
    setFootSizeInput(value);
    setErrors({ ...errors, foot_size_us: '' });
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      setErrors({ ...errors, foot_size_us: 'Foot size must be a positive number.' });
    } else {
      const convertedSize = convertFootSize(value, footSizeUnit, 'us');
      setFormData({ ...formData, foot_size_us: convertedSize });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.username) newErrors.username = 'Username is required.';
      if (formData.username && formData.username.length < 3)
        newErrors.username = 'Username must be at least 3 characters.';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Please enter a valid email address.';
      if (formData.phone_number && formData.phone_number.replace(/\D/g, '').length < 6)
        newErrors.phone_number = 'Phone number must be at least 6 digits.';
      if (!user.email && !user.phone_number && !formData.email && !formData.phone_number)
        newErrors.email = 'Either email or phone number is required.';
    } else if (step === 2) {
      if (!formData.country) newErrors.country = 'Country is required.';
      if (!formData.province) newErrors.province = 'Province/State is required.';
      if (!formData.city) newErrors.city = 'City is required.';
      if (!formData.postal_code) newErrors.postal_code = 'Postal code is required.';
    } else if (step === 3) {
      if (formData.weight_kg && (isNaN(formData.weight_kg) || parseFloat(formData.weight_kg) <= 0))
        newErrors.weight_kg = 'Weight must be a positive number.';
      if (formData.height_cm && (isNaN(formData.height_cm) || parseFloat(formData.height_cm) <= 0))
        newErrors.height_cm = 'Height must be a positive number.';
      if (
        formData.chest_bust &&
        (isNaN(formData.chest_bust) || parseFloat(formData.chest_bust) <= 0)
      )
        newErrors.chest_bust = 'Chest/Bust must be a positive number.';
      if (formData.waist && (isNaN(formData.waist) || parseFloat(formData.waist) <= 0))
        newErrors.waist = 'Waist must be a positive number.';
      if (formData.hip && (isNaN(formData.hip) || parseFloat(formData.hip) <= 0))
        newErrors.hip = 'Hip must be a positive number.';
      if (formData.inseam && (isNaN(formData.inseam) || parseFloat(formData.inseam) <= 0))
        newErrors.inseam = 'Inseam must be a positive number.';
      if (
        formData.foot_size_us &&
        (isNaN(formData.foot_size_us) || parseFloat(formData.foot_size_us) <= 0)
      )
        newErrors.foot_size_us = 'Foot size must be a positive number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      setMessage('');
    } else {
      setMessage('Please fill in all required fields correctly.');
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      setMessage('Please fill in all required fields correctly.');
      return;
    }

    try {
      const payload = { ...formData };
      if (payload.phone_number && payload.country_code) {
        payload.phone_number = `${payload.country_code}${payload.phone_number.replace(/\D/g, '')}`;
      } else if (user.phone_number && !payload.phone_number) {
        // Preserve the existing phone_number if not modified
        payload.phone_number = user.phone_number;
      }
      delete payload.country_code;
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '') payload[key] = null;
      });

      const response = await fetch(`${API_BASE_URL}/account-setup/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (response.ok) {
        setMessage('Account setup completed successfully!');
        setTimeout(() => {
          onSetupComplete();
        }, 2000);
      } else {
        setErrors(json);
        setMessage(json.error || 'Failed to complete account setup.');
      }
    } catch (error) {
      setMessage('Error: Unable to connect to the server.');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Complete Your Profile (Step {step} of 3)</h2>

        {step === 1 && (
          <div className="form-step">
            <div className="input-group">
              <label htmlFor="username">
                <FaUser className="input-icon" /> Username
                <span className="helper-text"> (min 3 characters)</span>
              </label>
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
            {!user.email && (
              <div className="input-group">
                <label htmlFor="email">
                  <FaEnvelope className="input-icon" /> Email
                  <span className="helper-text"> (either email or phone required)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
            )}
            {!user.phone_number && (
              <div className="input-group">
                <label htmlFor="phone_number">
                  <FaPhone className="input-icon" /> Phone Number
                  <span className="helper-text"> (either email or phone required)</span>
                </label>
                <div className="unit-input">
                  <select
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    className={errors.phone_number ? 'input-error' : ''}
                  >
                    <option value="">Code</option>
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
                    placeholder="123456789"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={errors.phone_number ? 'input-error' : ''}
                  />
                </div>
                {errors.phone_number && <p className="error-text">{errors.phone_number}</p>}
              </div>
            )}
            <button type="button" className="btn-primary" onClick={handleNext}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <div className="input-group">
              <label htmlFor="country">
                <FaMapMarkerAlt className="input-icon" /> Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className={errors.country ? 'input-error' : ''}
              >
                <option value="">Select Country</option>
                {sortedCountries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && <p className="error-text">{errors.country}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="province">
                <FaMapMarkerAlt className="input-icon" /> Province/State
              </label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                disabled={!selectedCountry}
                className={errors.province ? 'input-error' : ''}
              >
                <option value="">Select Province/State</option>
                {getProvinces().map((province) => (
                  <option key={province.name} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
              {errors.province && <p className="error-text">{errors.province}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="city">
                <FaMapMarkerAlt className="input-icon" /> City
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={!selectedProvince}
                className={errors.city ? 'input-error' : ''}
              >
                <option value="">Select City</option>
                {getCities().map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="postal_code">
                <FaMapMarkerAlt className="input-icon" /> Postal Code
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                placeholder="Enter your postal code"
                value={formData.postal_code}
                onChange={handleChange}
                required
                className={errors.postal_code ? 'input-error' : ''}
              />
              {errors.postal_code && <p className="error-text">{errors.postal_code}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="full_address">
                <FaMapMarkerAlt className="input-icon" /> Full Address
                <span className="helper-text"> (optional)</span>
              </label>
              <textarea
                id="full_address"
                name="full_address"
                placeholder="Enter your full address"
                value={formData.full_address}
                onChange={handleChange}
                className={errors.full_address ? 'input-error' : ''}
              />
              {errors.full_address && <p className="error-text">{errors.full_address}</p>}
            </div>
            <div className="button-group">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                Previous
              </button>
              <button type="button" className="btn-primary" onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <div className="input-group">
              <label htmlFor="weight_kg">
                <FaWeight className="input-icon" /> Weight
                <span className="helper-text"> (optional)</span>
              </label>
              <div className="unit-input">
                <input
                  type="number"
                  id="weight_kg"
                  placeholder="Enter your weight"
                  value={weightInput}
                  onChange={handleWeightChange}
                  min="0"
                  step="0.1"
                  className={errors.weight_kg ? 'input-error' : ''}
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              {errors.weight_kg && <p className="error-text">{errors.weight_kg}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="height_cm">
                <FaRuler className="input-icon" /> Height
                <span className="helper-text"> (optional)</span>
              </label>
              <div className="unit-input">
                {heightUnit === 'cm' ? (
                  <input
                    type="number"
                    id="height_cm"
                    placeholder="Enter your height"
                    value={heightCmInput}
                    onChange={(e) => handleHeightChange(e, 'cm')}
                    min="0"
                    step="0.1"
                    className={errors.height_cm ? 'input-error' : ''}
                  />
                ) : (
                  <div className="height-ft-in">
                    <input
                      type="number"
                      id="height_ft"
                      placeholder="Feet"
                      value={heightFt}
                      onChange={(e) => handleHeightChange(e, 'ft')}
                      min="0"
                      className={errors.height_cm ? 'input-error' : ''}
                    />
                    <input
                      type="number"
                      id="height_in"
                      placeholder="Inches"
                      value={heightIn}
                      onChange={(e) => handleHeightChange(e, 'in')}
                      min="0"
                      step="0.1"
                      className={errors.height_cm ? 'input-error' : ''}
                    />
                  </div>
                )}
                <select
                  value={heightUnit}
                  onChange={(e) => setHeightUnit(e.target.value)}
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft/in</option>
                </select>
              </div>
              {errors.height_cm && <p className="error-text">{errors.height_cm}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="chest_bust">
                <FaRuler className="input-icon" /> Chest/Bust (cm)
                <span className="helper-text"> (optional)</span>
              </label>
              <input
                type="number"
                id="chest_bust"
                name="chest_bust"
                placeholder="Enter your chest/bust"
                value={formData.chest_bust}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={errors.chest_bust ? 'input-error' : ''}
              />
              {errors.chest_bust && <p className="error-text">{errors.chest_bust}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="waist">
                <FaRuler className="input-icon" /> Waist (cm)
                <span className="helper-text"> (optional)</span>
              </label>
              <input
                type="number"
                id="waist"
                name="waist"
                placeholder="Enter your waist"
                value={formData.waist}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={errors.waist ? 'input-error' : ''}
              />
              {errors.waist && <p className="error-text">{errors.waist}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="hip">
                <FaRuler className="input-icon" /> Hip (cm)
                <span className="helper-text"> (optional)</span>
              </label>
              <input
                type="number"
                id="hip"
                name="hip"
                placeholder="Enter your hip"
                value={formData.hip}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={errors.hip ? 'input-error' : ''}
              />
              {errors.hip && <p className="error-text">{errors.hip}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="inseam">
                <FaRuler className="input-icon" /> Inseam (cm)
                <span className="helper-text"> (optional)</span>
              </label>
              <input
                type="number"
                id="inseam"
                name="inseam"
                placeholder="Enter your inseam"
                value={formData.inseam}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={errors.inseam ? 'input-error' : ''}
              />
              {errors.inseam && <p className='error-text'>{errors.inseam}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="foot_size_us">
                <FaShoePrints className="input-icon" /> Foot Size
                <span className="helper-text"> (optional)</span>
              </label>
              <div className="unit-input">
                <input
                  type="number"
                  id="foot_size_us"
                  placeholder="Enter your foot size"
                  value={footSizeInput}
                  onChange={handleFootSizeChange}
                  min="0"
                  step="0.1"
                  className={errors.foot_size_us ? 'input-error' : ''}
                />
                <select
                  value={footSizeUnit}
                  onChange={(e) => setFootSizeUnit(e.target.value)}
                >
                  <option value="us">US</option>
                  <option value="eu">EU</option>
                </select>
              </div>
              {errors.foot_size_us && <p className="error-text">{errors.foot_size_us}</p>}
            </div>
            <div className="button-group">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                Previous
              </button>
              <button type="submit" className="btn-primary">
                Complete Setup
              </button>
            </div>
          </div>
        )}

        {message && (
          <p className={message.includes('Error') ? 'error-text' : 'message'}>{message}</p>
        )}
      </form>
    </div>
  );
}

export default AccountSetup;