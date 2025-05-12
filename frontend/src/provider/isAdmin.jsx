import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const isAdmin = ({ requiredRole, children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    axios.get('http://127.0.0.1:8000/api/verify/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      const isAdmin = res.data.is_staff;
      const userRole = isAdmin ? 'admin' : 'agent';
      setAuthorized(userRole === requiredRole);
    })
    .catch(() => setAuthorized(false))
    .finally(() => setLoading(false));
  }, [requiredRole]);

  if (loading) return <p>Checking permissions...</p>;
  if (!authorized) return <Navigate to="/unauthorized" />;

  return children;
};
