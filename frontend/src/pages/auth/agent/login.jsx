import axios from "axios";
import { useState } from "react";
import { useAuth } from "../../../provider/authProvider.jsx";
import { useNavigate } from "react-router-dom";



const LoginForm = () => {
  const navigate = useNavigate(); // Initialize navigation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setToken } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token", {
        username: email,
        password,
      });

      if (response.data.token) {
        setToken(response.data.token);
        navigate("/dashboard"); // Redirect after login
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };


  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginForm;