const supabase = require('../database/supabaseClient');
const multer = require('multer');

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });
exports.uploadImages = upload.array('images');

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
    const { name, category_id, price, stock, description, colors, sizes } = req.body;
    const seller_id = req.session.user?.user_id; // Ensure session exists

    // Insert the main product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{ seller_id, category_id, name, price, stock, description, status: true }])
      .select()
      .single();
    if (productError) throw productError;

    // Insert variants
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

    // Upload images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadPath = `${product.product_id}/${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product_images') // Match bucket name exactly
          .upload(uploadPath, file.buffer, {
            contentType: file.mimetype,
          });

        if (uploadError) throw new Error(`Image Upload Error: ${uploadError.message}`);

        // Insert image URL into the `product_images` table
        const imageUrl = `${supabaseUrl}/storage/v1/object/public/product_images/${uploadPath}`;
        const { error: imageInsertError } = await supabase.from('product_images').insert({
          product_id: product.product_id,
          image_url: imageUrl,
        });

        if (imageInsertError) throw new Error(`Image Insert Error: ${imageInsertError.message}`);
      }
    }

    res.redirect('/seller/dashboard');
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).send('Server Error');
  }
};
