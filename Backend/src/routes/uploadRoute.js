const express = require("express");
const fs = require("fs");
const multer = require("multer");

const { protect } = require("../middleware/authMiddleware");
const { uploadPhotos } = require("../controller/uploadController");

const router = express.Router();

fs.mkdirSync("uploads", { recursive: true });

const maxPhotoSizeMb = Number(process.env.MAX_PHOTO_SIZE_MB || 15);
const maxPhotoSizeBytes = maxPhotoSizeMb * 1024 * 1024;

const cleanupFiles = (files = []) => {
  for (const file of files) {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: maxPhotoSizeBytes,
    files: 6,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }

    cb(null, true);
  },
});

const uploadPhotosMiddleware = (req, res, next) => {
  upload.array("photos", 6)(req, res, (error) => {
    if (!error) {
      return next();
    }

    cleanupFiles(req.files);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: `Each photo must be ${maxPhotoSizeMb}MB or smaller`,
        });
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "You can upload up to 6 photos",
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Invalid photo upload",
    });
  });
};

router.post(
  "/upload-photos",
  protect,
  uploadPhotosMiddleware,
  uploadPhotos
);

module.exports = router;
