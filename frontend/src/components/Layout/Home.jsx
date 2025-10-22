import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Welcome to ToDo App</h1>
        <p className="hero-subtitle">
          Organize your tasks, boost your productivity, and achieve your goals.
        </p>

        <div className="hero-features">
          <div className="feature">
            <div className="feature-icon">✓</div>
            <h3>Easy Task Management</h3>
            <p>Create, update, and organize your todos effortlessly</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🏷️</div>
            <h3>Tags & Priorities</h3>
            <p>Categorize and prioritize your tasks efficiently</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📅</div>
            <h3>Due Dates</h3>
            <p>Never miss a deadline with reminders and tracking</p>
          </div>
        </div>

        <div className="hero-cta">
          {isAuthenticated ? (
            <Link to="/todos" className="btn btn-hero">
              Go to My Todos
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-hero">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-hero-secondary">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
