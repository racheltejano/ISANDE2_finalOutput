const express = require('express');
const router = express.Router();
const { getPendingSellers, updateSellerApproval } = require('../controller/adminController');

// GET route to render the admin seller approval page
router.get('/seller-approval', getPendingSellers);

// POST route to handle approval or rejection of sellers
router.post('/seller-approval/:sellerId', updateSellerApproval);

module.exports = router;
