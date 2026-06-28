const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

// Use memory storage for Cloudinary direct upload
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Upload single file middleware
 */
exports.uploadSingle = (fieldName) => upload.single(fieldName);

/**
 * Upload multiple files middleware
 */
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

/**
 * Uploads a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
exports.uploadToCloudinary = (buffer, folder = 'zomato-clone') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};
