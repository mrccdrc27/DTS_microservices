import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './agent-login.module.css';
import { jwtDecode } from "jwt-decode";

const ticketURL = import.meta.env.VITE_LOGIN_API;


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // send credentials to API
      const response = await axios.post(`${ticketURL}`, { email, password });
      localStorage.setItem("accessToken", response.data.tokens.access);
      localStorage.setItem("refreshToken", response.data.tokens.refresh)
      console.log('login response', response)
      // navigate to protected route
      if(response.data.is_staff === true ){
        navigate('/admin');
      }
      else{
        navigate('/agent');
      }
    } catch (err) {
      console.error('Login failed', err);
      setError('Invalid email or password');
    }
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
