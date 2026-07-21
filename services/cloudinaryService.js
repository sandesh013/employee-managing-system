const cloudinary = require("cloudinary").v2;

const isCloudinaryConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Uploads a local file (from multer's disk storage) to Cloudinary and
// returns the hosted URL. Falls back to the local path if Cloudinary
// credentials haven't been added to .env yet — so uploads still work
// end-to-end during local development, they just aren't cloud-hosted.
const uploadToCloud = async (localFilePath, folder = "ems") => {
  if (!isCloudinaryConfigured()) {
    return localFilePath; // served via /uploads static route
  }
  const result = await cloudinary.uploader.upload(localFilePath, { folder });
  return result.secure_url;
};

module.exports = { uploadToCloud, isCloudinaryConfigured };
