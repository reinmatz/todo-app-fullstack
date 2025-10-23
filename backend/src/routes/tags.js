import express from 'express';
import {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  searchTags
} from '../controllers/tagController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All tag routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/tags
 * @desc    Get all tags
 * @access  Private
 */
router.get('/', getAllTags);

/**
 * @route   GET /api/tags/search
 * @desc    Search tags by name
 * @access  Private
 * @query   q (search query)
 */
router.get('/search', searchTags);

/**
 * @route   GET /api/tags/:id
 * @desc    Get tag by ID
 * @access  Private
 */
router.get('/:id', getTagById);

/**
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 */
router.post('/', createTag);

/**
 * @route   PUT /api/tags/:id
 * @desc    Update a tag
 * @access  Private
 */
router.put('/:id', updateTag);

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag
 * @access  Private
 */
router.delete('/:id', deleteTag);

export default router;
