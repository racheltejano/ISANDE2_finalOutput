const express = require('express');
const router = express.Router();
const { getPendingSellers, updateSellerApproval, getInventory, getPendingSellersCount, getProductCount, getInventorySummary } = require('../controller/adminController');


// Updated dashboard route
router.get('/dashboard', getPendingSellersCount, async (req, res) => {
    try {
        // Fetch product count and inventory summary
        const productCount = await getProductCount();
        const inventorySummary = await getInventorySummary();

        // Render dashboard with data
        res.render('System/admin/adminDashboard', {
            pendingSellersCount: req.pendingSellersCount,
            productCount,
            inventorySummary, // Pass summarized inventory to the view
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