import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import defaultAvatar from "../asserts/default-user.jpg";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  // Check if current route is active
  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };
  

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="navbar desktop-nav">
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🌱</span>
            <h2 className="logo-text">Carbon Tracker</h2>
          </Link>
        </div>

        <ul className="nav-links">
          <li className={`nav-item ${isActive("/") ? "active" : ""}`}>
            <Link to="/">Home</Link>
            <div className="nav-indicator"></div>
          </li>
          <li className={`nav-item ${isActive("/todays-emission") ? "active" : ""}`}>
            <Link to="/todays-emission">Today's Emission</Link>
            <div className="nav-indicator"></div>
          </li>
          <li className={`nav-item ${isActive("/historical-analysis") ? "active" : ""}`}>
            <Link to="/historical-analysis">Historical Analysis</Link>
            <div className="nav-indicator"></div>
          </li>
          <li className={`nav-item ${isActive("/activity-log") ? "active" : ""}`}>
            <Link to="/activity-log">Activity Log</Link>
            <div className="nav-indicator"></div>
          </li>
        </ul>

        <div className="nav-actions">
          {user ? (
            <div className="user-profile" ref={dropdownRef}>
              
              <img 
                 src={user.photoURL || defaultAvatar}
                alt="Profile" 
                className="profile-pic" 
  referrerPolicy="no-referrer"
                onClick={toggleProfileDropdown}
              /> 
           

              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-button login-btn">Log In</Link>
              <Link to="/register" className="nav-button signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="navbar mobile-nav">
        <div className="mobile-nav-header">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🌱</span>
            <h2 className="logo-text">Carbon Tracker</h2>
          </Link>
          <button 
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li className={`nav-item ${isActive("/") ? "active" : ""}`}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </li>
            <li className={`nav-item ${isActive("/todays-emission") ? "active" : ""}`}>
              <Link to="/todays-emission" onClick={() => setMobileMenuOpen(false)}>Today's Emission</Link>
            </li>
            <li className={`nav-item ${isActive("/historical-analysis") ? "active" : ""}`}>
              <Link to="/historical-analysis" onClick={() => setMobileMenuOpen(false)}>Historical Analysis</Link>
            </li>
            <li className={`nav-item ${isActive("/activity-log") ? "active" : ""}`}>
              <Link to="/activity-log" onClick={() => setMobileMenuOpen(false)}>Activity Log</Link>
            </li>
          </ul>

          <div className="mobile-actions">
            {user ? (
              <div className="user-profile">
                <img src={user.photoURL || defaultAvatar} alt="Profile" className="profile-pic" />
                <button onClick={handleLogout} className="nav-button logout-btn">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-button login-btn" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="nav-button signup-btn" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;