const express = require('express');
const router = express.Router();
const { getPendingSellers, updateSellerApproval, getInventory, getPendingSellersCount, getProductCount } = require('../controller/adminController');


// Consolidated dashboard route
router.get('/dashboard', getPendingSellersCount, async (req, res) => {
    try {
        // Fetch product count
        const productCount = await getProductCount();

        // Render dashboard with both counts
        res.render('System/admin/adminDashboard', {
            pendingSellersCount: req.pendingSellersCount, // From middleware
            productCount, // From database
        });
    } catch (err) {
        console.error('Error rendering adminDashboard:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// GET route to render the admin seller approval page
router.get('/seller-approval', getPendingSellers);
// PUT route to handle approval or rejection of sellers
router.put('/seller-action/:sellerId', updateSellerApproval);


// Route to fetch inventory data (in-progress)
router.get('/inventory', getInventory);

module.exports = router;