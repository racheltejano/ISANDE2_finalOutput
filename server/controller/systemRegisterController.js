const supabaseClient = require('../database/supabaseClient'); // Import your Supabase client
const bcrypt = require('bcrypt');

//WORKING ALREADY DO NOT TOUCH

const systemRegisterController = {
  registerSeller: async (req, res) => {
    try {
      const { username, fname, lname, contactNumber, address, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).send('Password and Confirm Password do not match');
      }

      // Hash the user's password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Fetch the seller role (role_id = 2)
      const sellerRoleId = 2;

      // Combine first and last name for full name
      const fullName = `${fname} ${lname}`;

      // Step 1: Insert into 'users' table
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .insert([
          {
            username,
            password: hashedPassword,
            role_id: sellerRoleId,
            created_at: new Date(),
          },
        ])
        .select();

      if (userError) {
        console.error('Error inserting user:', userError);
        return res.status(500).send('Error registering seller');
      }

      const userId = userData[0]?.user_id;
      if (!userId) {
        console.error('User ID not returned:', userData);
        return res.status(500).send('Error retrieving user ID');
      }

      // Step 2: Insert into 'sellers' table
      const { data: sellerData, error: sellerError } = await supabaseClient
        .from('sellers')
        .insert([
          {
            user_id: userId, // Foreign key reference to `users` table
            name:fullName, // Name of the seller or business
            contact_info: contactNumber, // Seller's contact info
            address, // Seller's address
            status: true, //for monitoring of the seller's inactivity
            approval_status: false, // Set to pending approval (false)
          },
        ]);

      if (sellerError) {
        console.error('Error inserting seller:', sellerError);
        return res.status(500).send('Error registering seller');
      }

      console.log('Seller registered successfully:', sellerData);

      // Notify the seller about the pending approval
      return res.status(200).send('Account registered successfully. Your account is pending admin approval.');
    } catch (error) {
      console.error('Error in registerSeller function:', error);
      return res.status(500).send('Error registering seller');
    }
  },
};

module.exports = systemRegisterController;
