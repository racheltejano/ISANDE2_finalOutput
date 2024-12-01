const express = require('express');
const router = express.Router();
const customerController = require('../controller/customerController');

// Define a GET route for fetching product details by ID
// The ':id' in the route is a route parameter that will capture the product ID from the URL
router.get('/product-details/:id', customerController.getProductDetailsPage);

router.get('/product-cart', customerController.getProductCartPage);

router.get('/product-cart/product/:id', customerController.getProductsByID);

router.post('/product-cart/order', customerController.postCart);

module.exports = router;
