// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ requiredRole }) => {
  const [authorized, setAuthorized] = useState(null); // null: loading, false: deny, true: allow

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('verify token get', token)
    if (!token) return setAuthorized(false);

    axios.get('http://127.0.0.1:8000/api/verify/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log('verify response', res)
      const isAdmin = res.data.is_staff;
      const userRole = isAdmin ? 'admin' : 'agent';
      setAuthorized(userRole === requiredRole);
    })
    .catch(() => setAuthorized(false));
  }, [requiredRole]);

  if (authorized === null) return <p>Checking authorization...</p>;
  if (!authorized) return <Navigate to="/unauthorized" />;

  return <Outlet />;
};

export default ProtectedRoute;
