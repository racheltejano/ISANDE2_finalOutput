const express = require('express');
const router = express.Router();
const sellerController = require('../controller/sellerController');

// Add Product Routes
router.get('/add-product', sellerController.getAddProductPage);
router.post('/add-product', sellerController.uploadImages, sellerController.addProduct);


// Seller Dashboard Routes
router.get('/dashboard', sellerController.dashboard); // Route for the dashboard
router.get('/inventory', sellerController.inventory); // Route for the inventory page
router.get('/out-of-stock-items', sellerController.outOfStockItems); // Route for out-of-stock items


router.post('/test', (req, res) => {
    res.send('POST route works!');
  });
  
module.exports = router;
