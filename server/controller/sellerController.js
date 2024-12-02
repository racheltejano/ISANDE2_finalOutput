const supabase = require('../database/supabaseClient');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multerConfig');
const { getProductCount } = require('../controller/adminController');

exports.uploadImages = upload.array('images');

exports.isSeller = async (user_id) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('role_id')
    .eq('user_id', user_id)
    .single();

  if (error || !user) {
    throw new Error('User not found or unable to fetch role.');
  }

  return user.role_id === 2; 
};

// Display the Add Product Page
exports.getAddProductPage = async (req, res) => {
  try {
    const { data: categories, error } = await supabase.from('categories').select('*');
    if (error) throw error;

    res.render('System/addProducts', { categories });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).send('Server Error');
  }
};

// Handle Product Addition
exports.addProduct = async (req, res) => {
  try {
    const { name, category_id, price, stock, description, attributes } = req.body;
    const user_id = req.session.user?.user_id; 

    if (!user_id) {
      return res.status(401).send('Unauthorized: User not logged in.');
    }

    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('seller_id')
      .eq('user_id', user_id)
      .single();

    if (sellerError || !seller) {
      return res.status(403).send('Unauthorized: User is not a seller.');
    }

    const seller_id = seller.seller_id; 
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{ seller_id, category_id, name, price, stock, description, status: true }])
      .select()
      .single();
    if (productError) throw productError;

     if (req.body.attributes) {
      const attributes = JSON.parse(req.body.attributes); 
      for (const attribute of attributes) {
        const { attribute_id, value } = attribute; 
        await supabase.from('product_attributes').insert({
          product_id: product.product_id,
          attribute_id,
          value,
        });
      }
    }

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        console.log(req.files);
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: 'auto', 
          public_id: `${product.product_id}/${file.originalname}`, 
        });

        // Make sure the result contains a valid image URL
        const imageUrl = result.secure_url;

        if (!imageUrl) {
          throw new Error('Failed to get image URL from Cloudinary.');
        }

        // Insert image URL into the `product_images` table in Supabase
        const { error: imageInsertError } = await supabase.from('product_images').insert({
          product_id: product.product_id,
          image_url: imageUrl,
        });

        if (imageInsertError) throw new Error(`Image Insert Error: ${imageInsertError.message}`);
      } catch (err) {
        console.error('Error uploading image to Cloudinary:', err.message);
        throw new Error('Error uploading image');
      }
    }
  }

    res.redirect('/seller/add-Product');
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).send('Server Error');
  }
};

// Seller Dashboard
exports.dashboard = async (req, res) => {
  try {
      const user_id = req.session.user?.user_id;
      if (!user_id || !(await exports.isSeller(user_id))) {
        return res.status(403).send('Unauthorized: User is not a seller.');
      }


      const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user_id);

      if (productsError) throw productsError;

      const productCount = products.length;
      const outOfStockItemsCount = products.filter((product) => product.stock === 0).length;

      console.log("Out-of-stock count:", outOfStockItemsCount);

      // You can also fetch other necessary data like pending orders or earnings here
      const pendingOrdersCount = 56; // Example static data
      const totalEarnings = 450000; // Example static data

      // Pass the data to the view
      res.render('System/seller/sellerDashboard', {
        productCount,
        outOfStockItemsCount,
        pendingOrdersCount,
        totalEarnings,
      });
  } catch (error) {
      console.error("Error fetching dashboard data: ", error);
      res.status(500).send("Error fetching dashboard data.");
  }
};

// All Products page
exports.inventory = async (req, res) => {
  try {
    const user_id = req.session.user?.user_id;
    if (!user_id || !(await exports.isSeller(user_id))) {
      return res.status(403).send('Unauthorized: User is not a seller.');
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user_id);

    if (productsError) throw productsError;

    res.render('seller/inventory', { products });
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).send('Server Error');
  }
};

// Out-of-Stock Items
exports.outOfStockItems = async (req, res) => {
  try {
    const user_id = req.session.user?.user_id;
    if (!user_id || !(await exports.isSeller(user_id))) {
      return res.status(403).send('Unauthorized: User is not a seller.');
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user_id)
      .eq('stock', 0);

    if (productsError) throw productsError;

    res.render('seller/outOfStockItems', { products });
  } catch (err) {
    console.error('Error fetching out-of-stock items:', err.message);
    res.status(500).send('Server Error');
  }
};
