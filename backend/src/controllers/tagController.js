import { Op } from 'sequelize';
import { Tag } from '../models/index.js';

/**
 * Get all tags
 * GET /api/tags
 */
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        tags: tags.map(tag => tag.toSafeObject()),
        count: tags.length
      }
    });
  } catch (error) {
    console.error('Get all tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching tags'
    });
  }
};

/**
 * Search tags by name
 * GET /api/tags/search?q=query
 */
export const searchTags = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const tags = await Tag.findAll({
      where: {
        name: {
          [Op.iLike]: `%${q.trim()}%`
        }
      },
      limit: 10,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        tags: tags.map(tag => tag.toSafeObject()),
        count: tags.length
      }
    });
  } catch (error) {
    console.error('Search tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Error searching tags'
    });
  }
};

export default {
  getAllTags,
  searchTags
};
