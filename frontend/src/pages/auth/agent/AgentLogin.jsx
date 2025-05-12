import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './agent-login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // send credentials to API
      const response = await axios.post('http://127.0.0.1:8000/api/token', { email, password });
      console.log("Success!", response.data)
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh)
      console.log(response)
      // navigate to protected route
      navigate('/agent');
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
              <h3>Docu<span>Flow</span></h3>
              <p>Document & Ticket Tracking System</p>
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
              {error && <p className={styles.errorMessage}>{error}</p>}
              <div className={styles.forgotPassword}>
                <a href="#">Forgot password?</a>
              </div>
              <button type="submit" className={styles.loginBtn}>Log In</button>
              <a href="/admin">Login as admin</a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
