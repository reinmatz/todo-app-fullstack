import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTodos } from '../../contexts/TodoContext';
import './Layout.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { resetFilters } = useTodos();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Reset filters when user logs out to ensure clean state for next login
    resetFilters();
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>ToDo App</h2>
        </Link>

        {isAuthenticated && (
          <div className="navbar-menu">
            <Link to="/todos" className="navbar-link">
              My Todos
            </Link>
            <Link to="/tags" className="navbar-link">
              Manage Tags
            </Link>
            <div className="navbar-user">
              <span className="user-name">Hello, {user?.username || 'User'}</span>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="navbar-menu">
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="btn btn-register">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
