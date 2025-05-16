import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '2rem', 
      color: '#ff4d4f', 
      fontSize: '1.5rem' 
    }}>
      <h1 style={{ marginBottom: '1rem' }}>404 - Not Found</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        The place you are looking for does not exist
      </p>

      {/* Image placeholder */}
      <img 
        src="../../../public/404.svg" // Make sure this exists in /public
        alt="Not Found Illustration" 
        style={{ width: '300px', height: '300px', marginBottom: '2rem' }} 
      />

      {/* Styled link as a button */}
      <br />
      <Link 
        to="/" 
        style={{ 
          color: '#fff',
          backgroundColor: '#1890ff',
          padding: '0.6rem 1.2rem',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '1rem',
          display: 'inline-block'
        }}
      >
        Go to Home
      </Link>
    </div>
  );
}
