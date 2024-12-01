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

/* GET Request for cart */
// Function to fetch customer details from Supabase
const fetchCustomerDetails = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user_id)
      .single(); // Use .single() to get a single record

    // Handle any errors from Supabase
    if (error) {
      console.error('Error fetching customer details:', error);
      throw new Error('Error fetching customer details'); // Throw an error to be caught in the calling function
    }

    return data; // Return the customer data
  } catch (err) {
    console.error('Unexpected error in fetchCustomerDetails:', err);
    throw err; // Re-throw the error to be handled in the calling function
  }
};

const fetchPaymentMethods = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')

    // Handle any errors from Supabase
    if (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Error fetching payment methods'); // Throw an error to be caught in the calling function
    }

    return data; // Return the customer data
  } catch (err) {
    console.error('Unexpected error in fetchPaymentMethods:', err);
    throw err; // Re-throw the error to be handled in the calling function
  }
}

const fetchShippingMethods = async () => {
  try {
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('*')

    // Handle any errors from Supabase
    if (error) {
      console.error('Error fetching shipping methods:', error);
      throw new Error('Error fetching payment methods'); // Throw an error to be caught in the calling function
    }

    return data; // Return the customer data
  } catch (err) {
    console.error('Unexpected error in fetchShippingMethods:', err);
    throw err; // Re-throw the error to be handled in the calling function
  }
}

// GET Request for cart
exports.getProductCartPage = async (req, res) => {
  try {
    // For testing purposes, using a hardcoded user_id
    const user_id = 'b93958ce-fb10-4c62-a2a0-84f764a1dcbf'; // Replace with req.session.user?.user_id in production

    // Check if user_id is available
    if (!user_id) {
      return res.status(401).send('User  not authenticated'); // Send an error if user is not authenticated
    }

    const customer = await fetchCustomerDetails(user_id);
    const payment_method = await fetchPaymentMethods();
    const shipping_methods = await fetchShippingMethods();

    // Render the product cart page, passing the customer data
    return res.render('System/productCart', { customer, payment_method, shipping_methods });

  } catch (err) {
    console.error('Unexpected error in getProductCartPage:', err);
    return res.status(500).send('Server Error'); // Catch any unexpected errors
  }
};

exports.getProductsByID = async (req, res) => {
  const productId = req.params.id;

  // Validate productId (assuming it's a number, you can adjust based on your needs)
  if (!productId || isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*') // Select all fields, or specify fields you need
      .eq('product_id', productId)
      .single();

    // Handle error from Supabase
    if (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Handle case where no product is found
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Return the product data with a 200 status
    return res.status(200).json(product);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.postCart = async (req, res) => {
  try {
    // Destructure the necessary fields from the request body
    const {
      customer_id,
      total_amount,
      payment_method,
      method_id,
    } = req.body;

    // Validate input
    if (!customer_id || !total_amount || !payment_method || !method_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Set the initial status ID (assuming 1 is for a new order)
    const status_id = 1;

    // Insert the new order into the 'orders' table
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_id,
          total_amount,
          payment_method,
          method_id,
          status_id,
        },
      ])
      .select();

    // Handle any errors from Supabase
    if (error) {
      console.error('Error inserting order:', error);
      return res.status(500).json({ error: 'Error creating order' });
    }

    // Return the newly created order data
    return res.status(201).json({ order: data });
  } catch (err) {
    console.error('Unexpected error in postCart:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
};
