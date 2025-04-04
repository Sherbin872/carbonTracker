import React from "react";
import "../styles/Home.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  return (
    <div className="home-container">
      {/* Hero Section with Full-Width Layout */}
      <header className="hero">
        <div className="hero-content">
          <h1>Track Your Carbon Footprint</h1>
          <p className="hero-subtitle">Take control of your environmental impact with our intuitive tracking system</p>
          <div className="cta-buttons">
             <Link to="/todays-emission" >
            <button className="primary-btn">Get Started</button></Link>
            <a href="#learn">
            <button className="secondary-btn">Learn More</button></a>
          </div>
        </div>
        <div className="hero-image">
          <div className="earth-icon">🌎</div>
        </div>
      </header>

      {/* Problem/Solution Section with Split Layout */}
      
      <div className="two-column-section">
        <section className="problem-statement card">
          <div className="section-header">
            <span className="icon">🌍</span>
            <h2>The Problem We're Solving</h2>
          </div>
          <p>Many people remain unaware of their daily carbon footprint. Common activities contribute significantly to global emissions:</p>
          <ul className="problem-list">
            <li>Transportation accounts for 29% of greenhouse gas emissions</li>
            <li>Food production contributes 26%</li>
            <li>Household energy use makes up 17%</li>
          </ul>
          <p>Without proper tracking, reducing your environmental impact becomes guesswork.</p>
        </section>

        <section className="our-solution card">
          <div className="section-header">
            <span className="icon">🚀</span>
            <h2>Our Smart Solution</h2>
          </div>
          <p>We've automated carbon tracking to make sustainability simple:</p>
          <div className="solution-features">
            <div className="feature">
              <div className="feature-icon">🤖</div>
              <p>Automatic calculations from your daily activities</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <p>Personalized insights and reduction targets</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📱</div>
              <p>Seamless integration with your lifestyle</p>
            </div>
          </div>
        </section>
      </div>

      {/* Benefits Section with Grid Layout */}
      <section   id="learn" className="benefits-section">
        <h2 className="section-title">Why Choose Our Platform</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Real-Time Tracking</h3>
            <p>Get instant feedback on how your choices affect your carbon footprint throughout the day.</p>
          </div>
          <div className="benefit-card highlight-card">
            <div className="benefit-icon">📈</div>
            <h3>Visual Analytics</h3>
            <p>Beautiful, easy-to-understand charts show your progress and areas for improvement.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🌱</div>
            <h3>Sustainable Habits</h3>
            <p>Personalized recommendations help you build eco-friendly routines that last.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🏆</div>
            <h3>Community Impact</h3>
            <p>See how your efforts contribute to larger environmental goals and challenges.</p>
          </div>
        </div>
      </section>

      {/* Testimonial Section with Alternating Layout */}
      <section className="testimonials">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonial left-aligned">
          <div className="testimonial-content">
            <p>"This app made me realize how much my commute was costing the planet. I switched to biking and cut my footprint by 40%!"</p>
            <div className="user">- Sarah K., Tirunelveli</div>
          </div>
          <div className="testimonial-image user1"></div>
        </div>
        <div className="testimonial right-aligned">
          <div className="testimonial-image user2"></div>
          <div className="testimonial-content">
            <p>"The food tracking feature changed how I grocery shop. I never knew plant-based choices could make such a difference."</p>
            <div className="user">- Arun R., Vannarapettai</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;