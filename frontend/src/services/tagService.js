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
  searchTags
};
