import React, { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import Pagination from '../Common/Pagination';
import './Todo.css';

const TodoPage = () => {
  const { todos, loading, filters, pagination, updateFilters, resetFilters, nextPage, prevPage, goToPage } = useTodos();
  const [showForm, setShowForm] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState(null);

  const handleCreateClick = () => {
    setTodoToEdit(null);
    setShowForm(true);
  };

  const handleEditClick = (todo) => {
    setTodoToEdit(todo);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setTodoToEdit(null);
  };

  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value });
  };

  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value });
  };

  const activeTodos = todos.filter(t => !t.is_completed);
  const completedTodos = todos.filter(t => t.is_completed);

  return (
    <div className="todo-page">
      <div className="todo-container">
        <div className="todo-header">
          <h1>My Todos</h1>
          <button className="btn btn-primary" onClick={handleCreateClick}>
            + New Todo
          </button>
        </div>

        <div className="todo-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search todos..."
              value={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="created_at">Date Created</option>
              <option value="updated_at">Date Updated</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select
              value={filters.order}
              onChange={(e) => handleFilterChange('order', e.target.value)}
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>

          <button className="btn btn-secondary btn-reset" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>

        <div className="todo-stats">
          <span className="stat">
            Total: <strong>{pagination.totalItems}</strong>
          </span>
          <span className="stat">
            Active: <strong>{activeTodos.length}</strong>
          </span>
          <span className="stat">
            Completed: <strong>{completedTodos.length}</strong>
          </span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <h2>No todos found</h2>
            <p>
              {filters.status !== 'all' || filters.priority !== 'all' || filters.search
                ? 'Try adjusting your filters'
                : 'Create your first todo to get started!'}
            </p>
            <button className="btn btn-primary" onClick={handleCreateClick}>
              + Create Todo
            </button>
          </div>
        ) : (
          <>
            <div className="todo-list">
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onEdit={handleEditClick}
                />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onGoToPage={goToPage}
            />
          </>
        )}
      </div>

      {showForm && (
        <TodoForm
          todoToEdit={todoToEdit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default TodoPage;
