import express from 'express';
import { getAllTags, searchTags } from '../controllers/tagController.js';
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

export default router;
