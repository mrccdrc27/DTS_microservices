import { useSearchParams, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import UserRegistration from '../pages/auth/UserRegistration';
import UserRegistration2 from '../pages/auth/UserRegistration2';

const ProtectedRegister = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/api/validate-token/?token=${token}`);
        console.log(res)
        if (res.data.valid) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (err) {
        setIsValid(false);
      }
    };

    if (token) checkToken();
    else setIsValid(false);
  }, [token]);

  if (isValid === null) return <p>Validating token...</p>;
  if (!isValid) return <Navigate to="/unauthorized" />;

  return <UserRegistration2 token={token} />;
};

export default ProtectedRegister;
