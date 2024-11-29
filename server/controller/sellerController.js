const supabase = require('../database/supabaseClient');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multerConfig');

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
    const { name, category_id, price, stock, description, attributes } = req.body;
    const seller_id = req.session.user?.user_id; // Ensure session exists

    // Insert the main product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{ seller_id, category_id, name, price, stock, description, status: true }])
      .select()
      .single();
    if (productError) throw productError;

     // Parse attributes (dynamic inputs)
     if (req.body.attributes) {
      const attributes = JSON.parse(req.body.attributes); // Parse JSON if sent as string
      for (const attribute of attributes) {
        const { attribute_id, value } = attribute; // Ensure these keys exist
        await supabase.from('product_attributes').insert({
          product_id: product.product_id,
          attribute_id,
          value,
        });
      }
    }

    // In your addProduct method:
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        console.log(req.files);
        // Upload the image to Cloudinary (use async/await instead of the callback)
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: 'auto', // Automatically detects file type (image, video, etc.)
          public_id: `${product.product_id}/${file.originalname}`, // Use product_id to organize images
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