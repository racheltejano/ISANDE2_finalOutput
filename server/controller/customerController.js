const supabase = require('../database/supabaseClient');

// Function to fetch product details by ID from the database
// Params: 
//   productId (string): The unique identifier of the product to fetch.
// Returns: 
//   Object: Returns the product details object or throws an error if the fetch fails.
const fetchProductDetails = async (productId) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
            product_id,
            name,
            description,
            price,
            stock,
            seller: sellers (name),
            category: categories (category_id, category_name),
            status,
            product_images: product_images (image_id, image_url),
            product_attributes: product_attributes (
                value,
                attribute: attributes (attribute_name)
            )
        `)
    .eq('product_id', productId)
    .single(); // Use .single() to get a single record

  if (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }

  return data;
};

// Function to format the fetched product details into a more usable structure for the frontend
// Params:
//   product (object): The raw product data object returned from the database.
// Returns:
//   Object: A formatted version of the product with necessary details and structured for rendering.
const formatProductDetails = (product, userId) => {
  return {
    id: product.product_id,
    name: product.name,
    price: product.price,
    description: product.description,
    stock: product.stock,
    seller: product.seller.name,
    category: {
      id: product.category.category_id,
      name: product.category.category_name,
    },
    status: product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock',
    images: product.product_images.map(image => image.image_url),
    attributes: product.product_attributes.map(attr => ({
      value: attr.value,
      name: attr.attribute.attribute_name,
    })),
    user_id: userId, // Include user_id in the formatted product details
  };
};

// Main function to handle the product details request, fetch and format the data, then render the page
// Params:
//   req (object): The request object containing the product ID from the URL params.
//   res (object): The response object used to render the page or return an error message.
// Returns:
//   Renders the product detail page or sends an error response.
exports.getProductDetailsPage = async (req, res) => {
  const productId = req.params.id; // Capture the product ID from the URL
  const user_id = req.session.user?.user_id;

  try {
    if (!productId) {
      return res.status(400).send('Product ID is required'); // Return an error if no ID is provided
    }

    const product = await fetchProductDetails(productId);  // Fetch product details
    const formattedProduct = formatProductDetails(product, user_id); // Format product data for the page

    // Render the product detail page, passing the formatted product details
    return res.render('System/productDetail', { product: formattedProduct });
  } catch (err) {
    console.error('Error fetching product details:', err.message);
    res.status(500).send('Server Error');
  }
};
