import React, { useState } from 'react';
import axios from 'axios';

const UserRegistration = ({ token }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  });

  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { first_name, last_name, password, password2 } = formData;

    if (!first_name || !last_name || !password || !password2) {
      setMessage('All fields are required');
      return;
    }

    if (password !== password2) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        `http://192.168.100.6:3000/api/authapi/register/${token}/`,
        {
    token, // <-- include this
    first_name,
    last_name,
    password,
    password2
        }
      );
      setMessage('Registration successful!');
      setSuccess(true);
    } catch (error) {
      const errMsg = error?.response?.data?.detail ||
                     error?.response?.data?.password2?.[0] ||
                     error?.response?.data?.password?.[0] ||
                     error?.response?.data?.non_field_errors?.[0] ||
                     error?.response?.data?.token?.[0] ||
                     'Registration failed';
      setMessage(errMsg);
      setSuccess(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8, fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <input
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <input
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
          type="password"
          name="password2"
          placeholder="Confirm Password"
          value={formData.password2}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Register
        </button>
        {message && (
          <p style={{
            marginTop: 10,
            color: success ? 'green' : 'red',
            textAlign: 'center'
          }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default UserRegistration;
