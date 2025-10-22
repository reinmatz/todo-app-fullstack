import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Todo = sequelize.define('Todo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    validate: {
      notNull: {
        msg: 'User ID is required'
      }
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Title is required'
      },
      notEmpty: {
        msg: 'Title cannot be empty'
      },
      len: {
        args: [1, 200],
        msg: 'Title must be between 1 and 200 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'Description cannot exceed 2000 characters'
      }
    }
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['low', 'medium', 'high', 'critical']],
        msg: 'Priority must be one of: low, medium, high, critical'
      }
    }
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Due date must be a valid date'
      }
    }
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'todos',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // Set completed_at when is_completed changes to true
    beforeUpdate: async (todo) => {
      if (todo.changed('is_completed')) {
        if (todo.is_completed) {
          todo.completed_at = new Date();
        } else {
          todo.completed_at = null;
        }
      }
    }
  }
});

// Define relationship with User
Todo.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE'
});

User.hasMany(Todo, {
  foreignKey: 'user_id',
  as: 'todos',
  onDelete: 'CASCADE'
});

/**
 * Instance method to check if todo is overdue
 * @returns {boolean} True if todo is overdue
 */
Todo.prototype.isOverdue = function() {
  if (!this.due_date || this.is_completed) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(this.due_date);
  return dueDate < today;
};

/**
 * Instance method to get safe todo object
 * @returns {Object} Todo object with computed fields
 */
Todo.prototype.toSafeObject = function() {
  return {
    id: this.id,
    user_id: this.user_id,
    title: this.title,
    description: this.description,
    is_completed: this.is_completed,
    priority: this.priority,
    due_date: this.due_date,
    completed_at: this.completed_at,
    is_overdue: this.isOverdue(),
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

export default Todo;
