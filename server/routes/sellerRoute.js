const express = require('express');
const router = express.Router();
const sellerController = require('../controller/sellerController');
const supabase = require('../database/supabaseClient');

// Seller Dashboard Routes
router.get('/dashboard', sellerController.dashboard);
router.get('/inventory', sellerController.inventory); 
router.get('/out-of-stock-items', sellerController.outOfStockItems); 
router.post('/edit-stock/:product_id', sellerController.updateStock);
router.post('/edit-stock/:product_id', sellerController.updateStock);

// Restock Product Route
router.post('/restock-product/:product_id', async (req, res) => {
  const { product_id } = req.params;

  try {
    const { error } = await supabase
      .from('products')
      .update({ stock: 10 }) // Adjust restock value as needed
      .eq('product_id', product_id);

    if (error) throw error;

    res.redirect('/seller/out-of-stock-items'); // Update redirect path if necessary
  } catch (err) {
    console.error('Error restocking product:', err.message);
    res.status(500).send('Error restocking product.');
  }
});

// Disable Product Route
router.post('/disable-product/:product_id', async (req, res) => {
  const { product_id } = req.params;

  try {
    // Update product status to "disabled" in the database
    const { error } = await supabase
      .from('products')
      .update({ status: 'disabled' }) // Assuming "status" is the column for product state
      .eq('product_id', product_id);

    if (error) {
      console.error("Error disabling product:", error.message);
      return res.status(500).send('Error disabling product');
    }

    res.redirect('/seller/out-of-stock-items'); // Adjust redirection as needed
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send('Unexpected error occurred');
  }
});

// Add Product Routes
router.get('/add-product', sellerController.getAddProductPage);
router.post('/add-product', sellerController.uploadImages, sellerController.addProduct);
router.post('/test', (req, res) => {
    res.send('POST route works!');
  });
  
module.exports = router;
