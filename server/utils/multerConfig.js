const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary'); // Adjust path to where your Cloudinary config is located

// Set up Cloudinary storage configuration for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Pass your cloudinary instance
  params: {
    folder: 'product_images', // Specify the folder name in Cloudinary where the images will be uploaded
    allowed_formats: ['jpg', 'jpeg', 'png'], // List of allowed image formats
    public_id: (req, file) => `${req.body.product_id}/${Date.now()}-${file.originalname}`, // Generate a unique public ID
  },
});

// Create multer instance using the Cloudinary storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
