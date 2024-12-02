const express = require('express');
const router = express.Router();
const sellerController = require('../controller/sellerController');

// Seller Dashboard Routes
router.get('/dashboard', sellerController.dashboard);
router.get('/inventory', sellerController.inventory); 
router.get('/out-of-stock-items', sellerController.outOfStockItems); 


// Edit Stock Route
router.get('/edit-stock/:product_id', sellerController.getEditStockPage); 
router.post('/edit-stock/:product_id', sellerController.updateStock); 


// Add Product Routes
router.get('/add-product', sellerController.getAddProductPage);
router.post('/add-product', sellerController.uploadImages, sellerController.addProduct);
router.post('/test', (req, res) => {
    res.send('POST route works!');
  });
  
module.exports = router;
