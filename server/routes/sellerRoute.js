const express = require('express');
const router = express.Router();
const sellerController = require('../controller/sellerController');

// Add Product Routes
router.get('/add-product', sellerController.getAddProductPage);
router.post('/add-product', sellerController.uploadImages, sellerController.addProduct);


router.post('/test', (req, res) => {
    res.send('POST route works!');
  });
  
module.exports = router;
