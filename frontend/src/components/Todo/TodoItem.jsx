import React, { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import './Todo.css';

const TodoItem = ({ todo, onEdit }) => {
  const { toggleTodo, deleteTodo } = useTodos();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = async () => {
    await toggleTodo(todo.id);
  };

  const handleDelete = async () => {
    const result = await deleteTodo(todo.id);
    if (result.success) {
      setShowDeleteConfirm(false);
    }
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = () => {
    if (!todo.due_date || todo.is_completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.due_date);
    return dueDate < today;
  };

  return (
    <div className={`todo-item ${todo.is_completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={todo.is_completed}
          onChange={handleToggle}
          id={`todo-${todo.id}`}
        />
        <label htmlFor={`todo-${todo.id}`}></label>
      </div>

      <div className="todo-content">
        <h3 className="todo-title">{todo.title}</h3>
        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-meta">
          <span className={`todo-priority ${getPriorityClass(todo.priority)}`}>
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
          </span>

          {todo.due_date && (
            <span className="todo-due-date">
              📅 {formatDate(todo.due_date)}
              {isOverdue() && <span className="overdue-badge">Overdue!</span>}
            </span>
          )}

          {todo.tags && todo.tags.length > 0 && (
            <div className="todo-tags">
              {todo.tags.map(tag => (
                <span key={tag.id} className="todo-tag">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button
          className="btn-icon btn-edit"
          onClick={() => onEdit(todo)}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="btn-icon btn-delete"
          onClick={() => setShowDeleteConfirm(true)}
          title="Delete"
        >
          🗑️
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm" onClick={(e) => e.stopPropagation()}>
            <h4>Delete Todo?</h4>
            <p>Are you sure you want to delete "{todo.title}"?</p>
            <div className="delete-confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
