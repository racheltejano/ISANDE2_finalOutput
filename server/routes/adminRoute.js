const express = require('express');
const router = express.Router();
const supabaseClient = require('../database/supabaseClient');
const { getPendingSellers, updateSellerApproval, getInventory, getPendingSellersCount } = require('../controller/adminController');


router.get('/dashboard', getPendingSellersCount, (req, res) => {
    res.render('System/admin/adminDashboard', {
        pendingSellersCount: req.pendingSellersCount, // Pass count to EJS
    });
});

router.get('/dashboard', async (req, res) => {
  try {
      // Fetch the count of pending sellers
      const { data: sellers, error } = await supabaseClient
          .from('sellers')
          .select('id', { count: 'exact' })
          .eq('approval_status', false);

      if (error) {
          console.error('Error fetching pending sellers count:', error);
          return res.status(500).json({ message: 'Failed to fetch pending sellers count' });
      }

      const pendingSellerCount = sellers.length; // Or sellers.count if your DB supports it

      res.render('System/admin/adminDashboard', {
          pageTitle: 'Admin Dashboard',
          pendingSellerCount,
      });
  } catch (err) {
      console.error('Unexpected error:', err);
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