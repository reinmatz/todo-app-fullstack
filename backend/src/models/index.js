import sequelize from '../config/database.js';
import User from './User.js';
import Todo from './Todo.js';
import Tag from './Tag.js';

// Define Many-to-Many relationship between Todo and Tag
Todo.belongsToMany(Tag, {
  through: 'todo_tags',
  foreignKey: 'todo_id',
  otherKey: 'tag_id',
  as: 'tags',
  onDelete: 'CASCADE'
});

Tag.belongsToMany(Todo, {
  through: 'todo_tags',
  foreignKey: 'tag_id',
  otherKey: 'todo_id',
  as: 'todos',
  onDelete: 'CASCADE'
});

// Export all models and sequelize instance
export {
  sequelize,
  User,
  Todo,
  Tag
};

export default {
  sequelize,
  User,
  Todo,
  Tag
};
