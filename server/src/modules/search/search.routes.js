const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');

// Public routes
router.get('/', searchController.search);
router.get('/suggestions', searchController.getSuggestions);

module.exports = router;
