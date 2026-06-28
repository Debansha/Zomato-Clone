const searchService = require('./search.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

exports.search = asyncHandler(async (req, res) => {
  const { q, ...filters } = req.query;
  const result = await searchService.searchAll(q, filters);
  res.status(200).json(ApiResponse.success(result));
});

exports.getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await searchService.getSuggestions(req.query.q);
  res.status(200).json(ApiResponse.success(suggestions));
});
