const express = require('express');
const router = express.Router();
const { getPendingSellers, updateSellerApproval } = require('../controller/adminController');

router.get('/dashboard', (req, res) => {
    res.render('System/admin/adminDashboard'); // Adjust the path as needed
  });

// GET route to render the admin seller approval page
router.get('/seller-approval', getPendingSellers);

// POST route to handle approval or rejection of sellers
router.post('/seller-approval/:sellerId', updateSellerApproval);

module.exports = router;
