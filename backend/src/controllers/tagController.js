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
 * Get tag by ID
 * GET /api/tags/:id
 */
export const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: { tag: tag.toSafeObject() }
    });
  } catch (error) {
    console.error('Get tag by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching tag'
    });
  }
};

/**
 * Create a new tag
 * POST /api/tags
 */
export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tag name is required'
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Tag name must be 50 characters or less'
      });
    }

    // Check if tag with same name already exists for this user
    const existingTag = await Tag.findOne({
      where: {
        name: name.trim(),
        user_id: userId
      }
    });

    if (existingTag) {
      return res.status(409).json({
        success: false,
        error: 'A tag with this name already exists'
      });
    }

    // Create tag
    const tag = await Tag.create({
      name: name.trim(),
      color: color || '#3B82F6',
      user_id: userId
    });

    res.status(201).json({
      success: true,
      data: { tag: tag.toSafeObject() },
      message: 'Tag created successfully'
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating tag'
    });
  }
};

/**
 * Update a tag
 * PUT /api/tags/:id
 */
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user.id;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Check ownership
    if (tag.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this tag'
      });
    }

    // Validation
    if (name && name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tag name cannot be empty'
      });
    }

    if (name && name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Tag name must be 50 characters or less'
      });
    }

    // Check for duplicate name (excluding current tag)
    if (name && name.trim() !== tag.name) {
      const existingTag = await Tag.findOne({
        where: {
          name: name.trim(),
          user_id: userId,
          id: { [Op.ne]: id }
        }
      });

      if (existingTag) {
        return res.status(409).json({
          success: false,
          error: 'A tag with this name already exists'
        });
      }
    }

    // Update tag
    if (name) tag.name = name.trim();
    if (color) tag.color = color;
    await tag.save();

    res.json({
      success: true,
      data: { tag: tag.toSafeObject() },
      message: 'Tag updated successfully'
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating tag'
    });
  }
};

/**
 * Delete a tag
 * DELETE /api/tags/:id
 */
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Check ownership
    if (tag.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this tag'
      });
    }

    await tag.destroy();

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting tag'
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
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  searchTags
};
