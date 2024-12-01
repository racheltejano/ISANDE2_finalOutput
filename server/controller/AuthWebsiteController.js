const bcrypt = require('bcrypt');
const supabaseClient = require('../database/supabaseClient');

//WORKING ALREADY DO NOT TOUCH

const authWebsiteController = {
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      // Check if req.session exists
      if (!req.session) {
        return res.status(500).send('Session not initialized');
      }

      // Fetch the user from the database by username
      const { data: user, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('username', username)
        .single();


      if (error) {
        console.error('Error fetching user:', error);
        return res.status(500).send('Error fetching user');
      }

      if (error || !user) {
        console.error('User not found or error fetching user:', error);
        return res.status(401).send('Invalid username or password');
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send('Invalid username or password');
      }

      // Check the user's role and proceed accordingly
      if (user.role_id !== 1) { // Ensure only customers (role_id: 1) can log in
        return res.status(403).send('Access restricted to customers only.');
      }

      // Set session for the customer
      req.session.user = user; // Store user info in the session

      // Redirect the customer to their dashboard or home page
      return res.redirect('/customer/index');

    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).send('Error logging in');
    }
  },

  logout: (req, res) => {
    req.session.user = null;

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Could not log out. Please try again.');
      }

      // Clear the cookie
      res.clearCookie('connect.sid', { path: '/' }); // Specify the same path as the cookie

      return res.status(200).send('Logged out successfully.');
    });
  },
};

module.exports = authWebsiteController;
