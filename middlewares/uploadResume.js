// middlewares/uploadResume.js
const multer = require('multer');
const uploadResume = multer({ storage: multer.memoryStorage() });

module.exports = uploadResume;