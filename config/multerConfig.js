// config/multerConfig.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/avatars');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    crypto.randomBytes(16, (err, raw) => {
      if (err) return cb(err);
      
      cb(null, raw.toString('hex') + path.extname(file.originalname));
    });
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Chỉ cho phép tải lên file ảnh!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;