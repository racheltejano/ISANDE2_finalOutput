const express = require('express');
const router = express.Router();
const sellerController = require('../controller/sellerController');

// Routes for adding products
router.get('/add-product', sellerController.getAddProductPage);
router.post('/add-product', sellerController.uploadImages, sellerController.addProduct);

module.exports = router;
