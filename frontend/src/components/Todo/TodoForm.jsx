import React, { useState, useEffect } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import './Todo.css';

const TodoForm = ({ todoToEdit, onClose }) => {
  const { createTodo, updateTodo, tags } = useTodos();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (todoToEdit) {
      setFormData({
        title: todoToEdit.title || '',
        description: todoToEdit.description || '',
        priority: todoToEdit.priority || 'medium',
        due_date: todoToEdit.due_date || '',
        tags: todoToEdit.tags?.map(t => t.name) || []
      });
    }
  }, [todoToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handleTagToggle = (tagName) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    const todoData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      due_date: formData.due_date || null,
      tags: formData.tags.length > 0 ? formData.tags : undefined
    };

    const result = todoToEdit
      ? await updateTodo(todoToEdit.id, todoData)
      : await createTodo(todoData);

    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setSubmitError(result.error || 'Failed to save todo');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{todoToEdit ? 'Edit Todo' : 'Create New Todo'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {submitError && (
          <div className="error-message">{submitError}</div>
        )}

        <form onSubmit={handleSubmit} className="todo-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Enter todo title"
              disabled={loading}
              maxLength={200}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
            <small className="field-hint">{formData.title.length}/200</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Enter description (optional)"
              disabled={loading}
              rows={4}
              maxLength={2000}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
            <small className="field-hint">{formData.description.length}/2000</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="due_date">Due Date</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-selector">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-button ${formData.tags.includes(tag.name) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag.name)}
                  disabled={loading}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (todoToEdit ? 'Update Todo' : 'Create Todo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;
