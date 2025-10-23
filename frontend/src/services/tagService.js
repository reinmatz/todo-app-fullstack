import api from './api';

/**
 * Get all tags
 * @returns {Promise<Object>} Tags array
 */
export const getAllTags = async () => {
  try {
    const response = await api.get('/tags');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single tag by ID
 * @param {number} id - Tag ID
 * @returns {Promise<Object>} Tag object
 */
export const getTagById = async (id) => {
  try {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data (name, color)
 * @returns {Promise<Object>} Created tag
 */
export const createTag = async (tagData) => {
  try {
    const response = await api.post('/tags', tagData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing tag
 * @param {number} id - Tag ID
 * @param {Object} tagData - Updated tag data (name, color)
 * @returns {Promise<Object>} Updated tag
 */
export const updateTag = async (id, tagData) => {
  try {
    const response = await api.put(`/tags/${id}`, tagData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a tag
 * @param {number} id - Tag ID
 * @returns {Promise<Object>} Success message
 */
export const deleteTag = async (id) => {
  try {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search tags by name
 * @param {string} query - Search query
 * @returns {Promise<Object>} Tags array
 */
export const searchTags = async (query) => {
  try {
    const response = await api.get(`/tags/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  searchTags
};
