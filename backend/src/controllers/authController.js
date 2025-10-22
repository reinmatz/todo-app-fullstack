import { Op } from 'sequelize';
import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      logger.logSecurityEvent('REGISTRATION_FAILED_DUPLICATE', {
        email,
        username,
        ip: req.ip,
        reason: existingUser.email === email ? 'email_exists' : 'username_exists'
      });

      return res.status(400).json({
        success: false,
        error: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Create new user (password will be hashed by model hook)
    const user = await User.create({
      username,
      email,
      password_hash: password
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    logger.info('User registered successfully', {
      userId: user.id,
      username: user.username,
      email: user.email,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error registering user'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.logAuthFailure(email, req.ip, 'user_not_found');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.logAuthFailure(email, req.ip, 'invalid_password');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging in'
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 * Note: With JWT, logout is primarily handled on the client-side by removing the token
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
};

/**
 * Get current user
 * GET /api/auth/me
 * Requires authentication
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user data'
    });
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser
};
