import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "../styles/Register.css";
import { FaGoogle, FaFacebook } from "react-icons/fa";

const Register = () => {
  const { register, signInWithGoogle, signInWithFacebook } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSocialRegister = async (providerLogin) => {
    try {
      await providerLogin();
      navigate("/dashboard");
    } catch (error) {
      setError("Social registration failed: " + error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister} className="register-form">
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            required 
            className="register-input" 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            required 
            className="register-input" 
            minLength={6}
          />
          <input 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password" 
            required 
            className="register-input" 
          />
          <button type="submit" className="register-button">
            Register
          </button>
        </form>

        <div className="divider">or</div>

        <div className="social-register">
          <button 
            onClick={() => handleSocialRegister(signInWithGoogle)} 
            className="social-button google"
          >
            <FaGoogle className="social-icon" /> Continue with Google
          </button>
          <button 
            onClick={() => handleSocialRegister(signInWithFacebook)} 
            className="social-button facebook"
          >
            <FaFacebook className="social-icon" /> Continue with Facebook
          </button>
        </div>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;