import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      name: 'unique_username',
      msg: 'Username already exists'
    },
    validate: {
      notNull: {
        msg: 'Username is required'
      },
      notEmpty: {
        msg: 'Username cannot be empty'
      },
      len: {
        args: [3, 50],
        msg: 'Username must be between 3 and 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_email',
      msg: 'Email already exists'
    },
    validate: {
      notNull: {
        msg: 'Email is required'
      },
      notEmpty: {
        msg: 'Email cannot be empty'
      },
      isEmail: {
        msg: 'Must be a valid email address'
      }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Password is required'
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // Hash password before creating user
    beforeCreate: async (user) => {
      if (user.password_hash) {
        const saltRounds = 12;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
      }
    },
    // Hash password before updating if password changed
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const saltRounds = 12;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
      }
    }
  }
});

/**
 * Instance method to compare password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if password matches
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

/**
 * Instance method to get safe user object (without password)
 * @returns {Object} User object without sensitive data
 */
User.prototype.toSafeObject = function() {
  return {
    id: this.id,
    username: this.username,
    email: this.email,
    createdAt: this.created_at,
    updatedAt: this.updated_at
  };
};

export default User;
