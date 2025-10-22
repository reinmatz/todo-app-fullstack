import express from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo
} from '../controllers/todoController.js';
import { authenticate } from '../middleware/auth.js';
import { validateTodoCreate, validateTodoUpdate } from '../middleware/validator.js';

const router = express.Router();

// All todo routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/todos
 * @desc    Get all todos for authenticated user
 * @access  Private
 * @query   status, priority, tags, sortBy, order, search
 */
router.get('/', getAllTodos);

/**
 * @route   POST /api/todos
 * @desc    Create a new todo
 * @access  Private
 */
router.post('/', validateTodoCreate, createTodo);

/**
 * @route   GET /api/todos/:id
 * @desc    Get a single todo by ID
 * @access  Private
 */
router.get('/:id', getTodoById);

/**
 * @route   PUT /api/todos/:id
 * @desc    Update a todo
 * @access  Private
 */
router.put('/:id', validateTodoUpdate, updateTodo);

/**
 * @route   PATCH /api/todos/:id/toggle
 * @desc    Toggle todo completion status
 * @access  Private
 */
router.patch('/:id/toggle', toggleTodo);

/**
 * @route   DELETE /api/todos/:id
 * @desc    Delete a todo
 * @access  Private
 */
router.delete('/:id', deleteTodo);

export default router;
