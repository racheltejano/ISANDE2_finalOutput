const supabase = require('../database/supabaseClient');

exports.getProductDetailsPage = async (req, res) => {
  /*
  try {
    // Access the 'id' parameter from the request URL
    const productId = req.params.id; // Capture the product ID from the URL

    // Check if an ID was provided
    if (!productId) {
      return res.status(400).send('Product ID is required'); // Return an error if no ID is provided
    }

    // Fetch the specific product details from the 'products' table where the id matches productId
    const { data: productDetails, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId) // Filter by the product ID
      .single(); // Use .single() to get a single record

    // Check for errors in the query
    if (error) throw error;

    // Check if productDetails is null (not found)
    if (!productDetails) {
      return res.status(404).send('Product not found');
    }

    // Render the product detail page, passing the specific product details
    return res.render('System/productDetail', { product: productDetails });
  } catch (err) {
    // Log the error and send a server error response
    console.error('Error fetching product details:', err.message);
    res.status(500).send('Server Error');
  }
  */
  console.log("RENDERING PRODUCT DETAILS PAGE")
  return res.render('productDetail');
};
