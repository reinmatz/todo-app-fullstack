import { Op } from 'sequelize';
import { Todo, Tag } from '../models/index.js';

/**
 * Get all todos for the authenticated user
 * GET /api/todos
 * Query params: status, priority, tags, sortBy, order, search, page, limit
 */
export const getAllTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      priority,
      tags,
      sortBy = 'created_at',
      order = 'DESC',
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build where clause
    const where = { user_id: userId };

    // Filter by completion status
    if (status === 'completed') {
      where.is_completed = true;
    } else if (status === 'active') {
      where.is_completed = false;
    }

    // Filter by priority
    if (priority && ['low', 'medium', 'high', 'critical'].includes(priority)) {
      where.priority = priority;
    }

    // Search in title and description
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build include clause for tags
    const include = [{
      model: Tag,
      as: 'tags',
      attributes: ['id', 'name'],
      through: { attributes: [] } // Exclude junction table fields
    }];

    // Filter by tags if provided
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      include[0].where = {
        name: { [Op.in]: tagArray }
      };
      include[0].required = true; // Inner join
    }

    // Build order clause
    const validSortFields = ['created_at', 'updated_at', 'title', 'priority', 'due_date', 'is_completed'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const orderDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Fetch todos with pagination
    const { count, rows: todos } = await Todo.findAndCountAll({
      where,
      include,
      order: [[orderField, orderDirection]],
      limit: limitNum,
      offset: offset,
      distinct: true // Important for accurate count with includes
    });

    // Transform todos to safe objects
    const safeTodos = todos.map(todo => ({
      ...todo.toSafeObject(),
      tags: todo.tags.map(tag => tag.toSafeObject())
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      data: {
        todos: safeTodos,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all todos error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching todos'
    });
  }
};

/**
 * Get a single todo by ID
 * GET /api/todos/:id
 */
export const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      where: { id, user_id: userId },
      include: [{
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: {
        todo: {
          ...todo.toSafeObject(),
          tags: todo.tags.map(tag => tag.toSafeObject())
        }
      }
    });
  } catch (error) {
    console.error('Get todo by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching todo'
    });
  }
};

/**
 * Create a new todo
 * POST /api/todos
 */
export const createTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, priority, due_date, tags } = req.body;

    // Create todo
    const todo = await Todo.create({
      user_id: userId,
      title,
      description,
      priority: priority || 'medium',
      due_date,
      is_completed: false
    });

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim().toLowerCase() }
          });
          return tag;
        })
      );
      await todo.setTags(tagInstances);
    }

    // Fetch todo with tags
    const createdTodo = await Todo.findByPk(todo.id, {
      include: [{
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    res.status(201).json({
      success: true,
      data: {
        todo: {
          ...createdTodo.toSafeObject(),
          tags: createdTodo.tags.map(tag => tag.toSafeObject())
        }
      },
      message: 'Todo created successfully'
    });
  } catch (error) {
    console.error('Create todo error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error creating todo'
    });
  }
};

/**
 * Update a todo
 * PUT /api/todos/:id
 */
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, priority, due_date, is_completed, tags } = req.body;

    // Find todo
    const todo = await Todo.findOne({
      where: { id, user_id: userId }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Update fields
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (priority !== undefined) todo.priority = priority;
    if (due_date !== undefined) todo.due_date = due_date;
    if (is_completed !== undefined) todo.is_completed = is_completed;

    await todo.save();

    // Handle tags if provided
    if (tags && Array.isArray(tags)) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim().toLowerCase() }
          });
          return tag;
        })
      );
      await todo.setTags(tagInstances);
    }

    // Fetch updated todo with tags
    const updatedTodo = await Todo.findByPk(todo.id, {
      include: [{
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      data: {
        todo: {
          ...updatedTodo.toSafeObject(),
          tags: updatedTodo.tags.map(tag => tag.toSafeObject())
        }
      },
      message: 'Todo updated successfully'
    });
  } catch (error) {
    console.error('Update todo error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error updating todo'
    });
  }
};

/**
 * Toggle todo completion status
 * PATCH /api/todos/:id/toggle
 */
export const toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      where: { id, user_id: userId }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Toggle completion status
    todo.is_completed = !todo.is_completed;
    await todo.save();

    // Fetch todo with tags
    const updatedTodo = await Todo.findByPk(todo.id, {
      include: [{
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      data: {
        todo: {
          ...updatedTodo.toSafeObject(),
          tags: updatedTodo.tags.map(tag => tag.toSafeObject())
        }
      },
      message: `Todo marked as ${updatedTodo.is_completed ? 'completed' : 'active'}`
    });
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({
      success: false,
      error: 'Error toggling todo status'
    });
  }
};

/**
 * Delete a todo
 * DELETE /api/todos/:id
 */
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({
      where: { id, user_id: userId }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    await todo.destroy();

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting todo'
    });
  }
};

export default {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo
};
