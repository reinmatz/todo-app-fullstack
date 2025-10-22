import React, { createContext, useState, useEffect, useContext } from 'react';
import * as todoService from '../services/todoService';
import * as tagService from '../services/tagService';

// Create Todo Context
const TodoContext = createContext(null);

// Custom hook to use Todo Context
export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

// Todo Provider Component
export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    tags: [],
    sortBy: 'created_at',
    order: 'DESC',
    search: ''
  });

  // Fetch todos when filters change
  useEffect(() => {
    fetchTodos();
  }, [filters]);

  // Fetch available tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  /**
   * Fetch all todos with current filters
   */
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {};
      if (filters.status !== 'all') filterParams.status = filters.status;
      if (filters.priority !== 'all') filterParams.priority = filters.priority;
      if (filters.tags.length > 0) filterParams.tags = filters.tags;
      if (filters.sortBy) filterParams.sortBy = filters.sortBy;
      if (filters.order) filterParams.order = filters.order;
      if (filters.search) filterParams.search = filters.search;

      const response = await todoService.getAllTodos(filterParams);

      if (response.success) {
        setTodos(response.data.todos);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch todos');
      console.error('Fetch todos error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all available tags
   */
  const fetchTags = async () => {
    try {
      const response = await tagService.getAllTags();
      if (response.success) {
        setTags(response.data.tags);
      }
    } catch (err) {
      console.error('Fetch tags error:', err);
    }
  };

  /**
   * Create a new todo
   */
  const createTodo = async (todoData) => {
    try {
      setError(null);
      const response = await todoService.createTodo(todoData);

      if (response.success) {
        await fetchTodos(); // Refresh list
        await fetchTags(); // Update tags list
        return { success: true, todo: response.data.todo };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create todo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Update a todo
   */
  const updateTodo = async (id, todoData) => {
    try {
      setError(null);
      const response = await todoService.updateTodo(id, todoData);

      if (response.success) {
        await fetchTodos(); // Refresh list
        await fetchTags(); // Update tags list
        return { success: true, todo: response.data.todo };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update todo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Toggle todo completion status
   */
  const toggleTodo = async (id) => {
    try {
      setError(null);
      const response = await todoService.toggleTodo(id);

      if (response.success) {
        // Update todo in local state immediately for better UX
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo.id === id
              ? { ...todo, is_completed: !todo.is_completed }
              : todo
          )
        );
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to toggle todo';
      setError(errorMessage);
      // Refresh to revert optimistic update
      await fetchTodos();
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Delete a todo
   */
  const deleteTodo = async (id) => {
    try {
      setError(null);
      const response = await todoService.deleteTodo(id);

      if (response.success) {
        // Remove from local state immediately
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        return { success: true };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete todo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Update filters
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      tags: [],
      sortBy: 'created_at',
      order: 'DESC',
      search: ''
    });
  };

  const value = {
    todos,
    tags,
    loading,
    error,
    filters,
    fetchTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    updateFilters,
    resetFilters
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export default TodoContext;
