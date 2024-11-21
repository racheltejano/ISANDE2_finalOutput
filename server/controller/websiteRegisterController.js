const supabaseClient = require('../database/supabaseClient'); // Import your Supabase client
const bcrypt = require('bcrypt');

//WORKING ALREADY DO NOT TOUCH

const websiteRegisterController = {
  registerUser: async (req, res) => {
    try {
      const { username, fname, lname, contactNumber, address, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).send('Password and Confirm Password do not match');
      }

      // Hash the user's password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Fetch the customer role (role_id = 1)
      const customerRoleId = 1;

      // Combine first and last name for full name
      const fullName = `${fname} ${lname}`;

      // Step 1: Insert into 'users' table
      const { data: userData, error: userError } = await supabaseClient
        .from('users') // Table name updated to match your schema
        .insert([
          {
            username, // Column for the username
            password: hashedPassword, // Store the hashed password
            role_id: customerRoleId, // Role assigned as customer
            created_at: new Date(), // Assuming this is a timestamp
          },
        ])
        .select(); // Use select() to retrieve the generated `user_id`

      if (userError) {
        console.error('Error inserting user:', userError);
        return res.status(500).send('Error registering customer');
      }

      const userId = userData[0]?.user_id; // Assuming the primary key is `user_id`
      if (!userId) {
        return res.status(500).send('Error retrieving user ID');
      }

      // Step 2: Insert into 'customer' table
      const { data: customerData, error: customerError } = await supabaseClient
        .from('customers') // Assuming the table name is 'customers'
        .insert([
          {
            user_id: userId, // Foreign key reference to `users` table
            name: fullName, // Full name of the customer
            address, // Customer's address
            contact_info: contactNumber, // Customer's contact info
          },
        ]);

      if (customerError) {
        console.error('Error inserting customer:', customerError);
        return res.status(500).send('Error registering customer');
      }

      console.log('Customer registered successfully:', customerData);

      // Redirect to the welcome page
      return res.redirect('/customer/homepage');
    } catch (error) {
      console.error('Error in registerUser function:', error);
      return res.status(500).send('Error registering user');
    }
  },
};

module.exports = websiteRegisterController;
