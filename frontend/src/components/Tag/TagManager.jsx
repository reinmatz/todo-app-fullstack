import { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import './TagManager.css';

const TagManager = () => {
  const { tags, createTag, updateTag, deleteTag, loading } = useTodos();

  const [isAdding, setIsAdding] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });
  const [error, setError] = useState('');

  // Predefined color palette
  const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#84CC16', // Lime
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Tag name is required');
      return;
    }

    if (formData.name.length > 30) {
      setError('Tag name must be less than 30 characters');
      return;
    }

    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
      } else {
        await createTag(formData);
      }

      // Reset form
      setFormData({ name: '', color: '#3B82F6' });
      setIsAdding(false);
      setEditingTag(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save tag');
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color
    });
    setIsAdding(true);
  };

  const handleDelete = async (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag? It will be removed from all todos.')) {
      try {
        await deleteTag(tagId);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete tag');
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingTag(null);
    setFormData({ name: '', color: '#3B82F6' });
    setError('');
  };

  return (
    <div className="tag-manager">
      <div className="tag-manager-header">
        <h2>Tag Management</h2>
        {!isAdding && (
          <button
            className="btn btn-primary"
            onClick={() => setIsAdding(true)}
            disabled={loading}
          >
            + New Tag
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isAdding && (
        <form className="tag-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tag-name">Tag Name</label>
              <input
                id="tag-name"
                type="text"
                placeholder="Enter tag name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={30}
                required
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="tag-preview">
            <label>Preview:</label>
            <span
              className="tag-badge"
              style={{ backgroundColor: formData.color }}
            >
              {formData.name || 'Tag Name'}
            </span>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {editingTag ? 'Update Tag' : 'Create Tag'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="tags-list">
        {tags.length === 0 ? (
          <div className="empty-state">
            <p>No tags yet. Create your first tag to get started!</p>
          </div>
        ) : (
          <div className="tags-grid">
            {tags.map((tag) => (
              <div key={tag.id} className="tag-item">
                <div className="tag-info">
                  <span
                    className="tag-badge"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                  <span className="tag-color-code">{tag.color}</span>
                </div>
                <div className="tag-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(tag)}
                    disabled={loading}
                    title="Edit tag"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(tag.id)}
                    disabled={loading}
                    title="Delete tag"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManager;
