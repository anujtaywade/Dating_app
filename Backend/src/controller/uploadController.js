const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const cleanupFiles = (files = []) => {
  for (const file of files) {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};

const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No photos uploaded",
      });
    }

    const photoUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "crosscampus_profiles",
      });

      photoUrls.push(result.secure_url);

      cleanupFiles([file]);
    }

    return res.status(200).json({
      success: true,
      photos: photoUrls,
    });
  } catch (error) {
    cleanupFiles(req.files);
    console.error("Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: "Photo upload failed",
      error: error.message,
    });
  }
};

module.exports = {
  uploadPhotos,
};
