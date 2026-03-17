const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists - Use absolute path relative to this file
const uploadDir = path.join(__dirname, "../../uploads/cv");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
console.log("Multer saving files to:", uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and add timestamp
    const originalName = path
      .parse(file.originalname)
      .name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${originalName}_${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Only accept images
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ file ảnh (JPG, PNG)"), false);
  }
};

const uploadLocal = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = uploadLocal;
