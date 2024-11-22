const supabase = require('../database/supabaseClient');
const multer = require('multer');

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });
exports.uploadImages = upload.array('images');

// Display the Add Product Page
exports.getAddProductPage = async (req, res) => {
  try {
    // Fetch categories from the database
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
    const { name, category_id, price, stock, description, colors, sizes } = req.body;
    const seller_id = req.session.user?.user_id; // Make sure user session contains seller details

    // Insert product into the database
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{ seller_id, category_id, name, price, stock, description, status: true }])
      .select()
      .single();
    if (productError) throw productError;

    // Handle color and size variants
    const colorsArr = colors ? colors.split(',').map((c) => c.trim()) : [];
    const sizesArr = sizes ? sizes.split(',').map((s) => s.trim()) : [];

    for (const color of colorsArr) {
      for (const size of sizesArr) {
        await supabase.from('product_variants').insert({
          product_id: product.product_id,
          color,
          size,
          price,
          stock,
        });
      }
    }

    // Handle image uploads
    if (req.files) {
      for (const file of req.files) {
        const { data: img, error: imgError } = await supabase.storage
          .from('product-images')
          .upload(`${product.product_id}/${file.originalname}`, file.buffer, {
            contentType: file.mimetype,
          });
        if (imgError) throw imgError;

        await supabase.from('product_images').insert({
          product_id: product.product_id,
          image_url: img.path,
        });
      }
    }

    res.redirect('/seller/dashboard'); // Redirect to seller dashboard
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).send('Server Error');
  }
};
