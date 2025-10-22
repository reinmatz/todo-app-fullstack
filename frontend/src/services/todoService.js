import api from './api';

/**
 * Get all todos with optional filters
 * @param {Object} filters - { status, priority, tags, sortBy, order, search, page, limit }
 * @returns {Promise<Object>} Todos array with pagination
 */
export const getAllTodos = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.order) params.append('order', filters.order);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/todos?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single todo by ID
 * @param {number} id - Todo ID
 * @returns {Promise<Object>} Todo object
 */
export const getTodoById = async (id) => {
  try {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new todo
 * @param {Object} todoData - { title, description, priority, due_date, tags }
 * @returns {Promise<Object>} Created todo
 */
export const createTodo = async (todoData) => {
  try {
    const response = await api.post('/todos', todoData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a todo
 * @param {number} id - Todo ID
 * @param {Object} todoData - Updated fields
 * @returns {Promise<Object>} Updated todo
 */
export const updateTodo = async (id, todoData) => {
  try {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle todo completion status
 * @param {number} id - Todo ID
 * @returns {Promise<Object>} Updated todo
 */
export const toggleTodo = async (id) => {
  try {
    const response = await api.patch(`/todos/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a todo
 * @param {number} id - Todo ID
 * @returns {Promise<Object>} Success message
 */
export const deleteTodo = async (id) => {
  try {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
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
