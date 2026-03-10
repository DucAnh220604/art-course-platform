const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Check if file is PDF
    const isPdf = file.mimetype === "application/pdf";
    // Get original filename without extension and sanitize
    const originalName = path
      .parse(file.originalname)
      .name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = Date.now();
    const publicId = `${originalName}_${timestamp}`;

    return {
      folder: "art-kids",
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
      resource_type: isPdf ? "raw" : "image",
      public_id: publicId,
      // For PDF, add format to ensure .pdf extension in URL
      format: isPdf ? "pdf" : undefined,
    };
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
