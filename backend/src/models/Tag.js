import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      name: 'unique_tag_name',
      msg: 'Tag name already exists'
    },
    validate: {
      notNull: {
        msg: 'Tag name is required'
      },
      notEmpty: {
        msg: 'Tag name cannot be empty'
      },
      len: {
        args: [1, 50],
        msg: 'Tag name must be between 1 and 50 characters'
      }
    }
  }
}, {
  tableName: 'tags',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false // Tags don't need updated_at
});

/**
 * Instance method to get safe tag object
 * @returns {Object} Tag object
 */
Tag.prototype.toSafeObject = function() {
  return {
    id: this.id,
    name: this.name,
    created_at: this.created_at
  };
};

export default Tag;
