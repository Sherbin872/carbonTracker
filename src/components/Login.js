import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../styles/Login.css";
import { FaGoogle, FaFacebook } from "react-icons/fa";

const Login = () => {
  const { login, signInWithGoogle, signInWithFacebook } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/"; // Default redirect

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    await login(email, password);
    navigate(from, { replace: true });
  };

  const handleSocialLogin = async (providerLogin) => {
    try {
      await providerLogin();
      navigate(from, { replace: true }); // ✅ Redirect after login
    } catch (error) {
      console.error("Social login failed:", error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input type="email" name="email" placeholder="Email" required className="login-input" />
          <input type="password" name="password" placeholder="Password" required className="login-input" />
          <button type="submit" className="login-button">Login</button>
        </form>

        <div className="divider">or</div>

        <div className="social-login">
          <button onClick={() => handleSocialLogin(signInWithGoogle)} className="social-button google">
            <FaGoogle className="social-icon" /> Continue with Google
          </button>
          <button onClick={() => handleSocialLogin(signInWithFacebook)} className="social-button facebook">
            <FaFacebook className="social-icon" /> Continue with Facebook
          </button>
        </div>

        <div className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
