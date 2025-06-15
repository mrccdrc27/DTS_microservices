import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './agent-login.module.css';
import { jwtDecode } from "jwt-decode";

const ticketURL = import.meta.env.VITE_LOGIN_API;
const verifyOTPURL = import.meta.env.VITE_VERIFY_OTP_API; // Add this to your env file

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // send credentials to API
      const response = await axios.post(`${ticketURL}`, { email, password });
      console.log('login response', response);
      
      // Check if OTP is required
      if (response.data.temp_token) {
        // Store temp token and show OTP input
        setTempToken(response.data.temp_token);
        localStorage.setItem("tempToken", response.data.temp_token);
        setShowOTP(true);
        setError(null);
      } else {
        // Direct login without OTP (fallback)
        localStorage.setItem("accessToken", response.data.tokens.access);
        localStorage.setItem("refreshToken", response.data.tokens.refresh);
        
        if(response.data.is_staff === true ){
          navigate('/admin');
        } else {
          navigate('/agent');
        }
      }
    } catch (err) {
      console.error('Login failed', err);
      setError('Invalid email or password');
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${verifyOTPURL}`, {
        temp_token: tempToken,
        otp: otp
      });
      
      console.log('OTP verification response', response);
      
      // Store tokens
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      
      // Clear temp token
      localStorage.removeItem("tempToken");
      
      // Navigate based on user role
      if(response.data.is_staff === true) {
        navigate('/admin');
      } else {
        navigate('/agent');
      }
    } catch (err) {
      console.error('OTP verification failed', err);
      setError('Invalid or expired OTP');
    }
  };

  const handleBackToLogin = () => {
    setShowOTP(false);
    setOtp('');
    setTempToken('');
    setError(null);
    localStorage.removeItem("tempToken");
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginMainSection}>
        <div className={styles.loginLeftSection}></div>
        <div className={styles.loginRightSection}>
          <div className={styles.loginTopHeader}>
            <div className={styles.loginLogo}></div>
            <div className={styles.loginTitle}>
              <h3>Ticket<span>Flow</span></h3>
              <p>Flow-based Assignment & Ticket Tracking System</p>
            </div>
          </div>
          <div className={styles.loginBotInputs}>
            {!showOTP ? (
              // Login Form
              <form className={styles.loginForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="text"
                    id="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                <div className={styles.forgotPassword}>
                  {/* <a href="#">Forgot password?</a> */}
                </div>
                <button type="submit" className={styles.loginBtn}>Log In</button>
                {/* <a href="/admin">Login as admin</a> */}
              </form>
            ) : (
              // OTP Form
              <form className={styles.loginForm} onSubmit={handleOTPSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="otp">Enter OTP</label>
                  <input
                    type="text"
                    id="otp"
                    placeholder="Enter the 6-digit OTP sent to your email"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    OTP sent to {email}
                  </small>
                </div>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                <button type="submit" className={styles.loginBtn}>Verify OTP</button>
                <button 
                  type="button" 
                  onClick={handleBackToLogin}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#007bff', 
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;