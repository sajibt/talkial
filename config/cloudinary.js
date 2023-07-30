const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//Config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//instance of cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png", "jpeg"],
  params: {
    folder: "talkial/uploads/profilePhoto",
    transformation: [
      { width: 300, height: 300, crop: "fill", gravity: "face" },
    ],
  },
});

module.exports = storage;
