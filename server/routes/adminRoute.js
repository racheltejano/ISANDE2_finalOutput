const express = require('express');
const router = express.Router();
const { getPendingSellers, updateSellerApproval, getInventory, getPendingSellersCount, getProductCount, getInventorySummary } = require('../controller/adminController');


// Consolidated dashboard route
router.get('/dashboard', getPendingSellersCount, async (req, res) => {
    try {
        // Fetch
        const productCount = await getProductCount();
        const inventorySummary = await getInventorySummary();

        // Render dashboard data
        res.render('System/admin/adminDashboard', {
            pendingSellersCount: req.pendingSellersCount,
            productCount, 
            inventorySummary,
        });
    } catch (err) {
        console.error('Error rendering adminDashboard:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// working routes
router.get('/seller-approval', getPendingSellers);
router.put('/seller-action/:sellerId', updateSellerApproval);
router.get('/inventory', getInventory);

module.exports = router;