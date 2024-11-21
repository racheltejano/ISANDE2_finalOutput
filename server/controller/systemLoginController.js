const bcrypt = require('bcrypt');
const supabaseClient = require('../database/supabaseClient');

const systemLoginController = {
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      // Check if req.session exists
      if (!req.session) {
        return res.status(500).send('Session not initialized');
      }

      // Fetch the user from the database by username
      const { data: user, error } = await supabaseClient
        .from('user')
        .select('*')
        .eq('userName', username)
        .single();

      if (error) {
        return res.status(500).send('Error fetching user');
      }

      if (!user) {
        return res.status(401).send('Invalid username or password');
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send('Invalid username or password');
      }

      // Check the user's role and proceed accordingly
      switch (user.role_id) {
        case 1: // Customer
          // Customers can only log into the website, not the system
          return res.status(403).send('Customers cannot access the system');

        case 2: // Seller
          // Sellers need to be approved by the admin
          if (user.approved !== true) {
            return res.status(403).send('Seller account is pending approval');
          }
          // Sellers can log in to the system but not the website
          req.session.user = user; // Set session for the seller
          return res.redirect('/seller/dashboard'); // Redirect to seller's dashboard

        case 3: // Admin
          // Only one admin exists; Admin can log into the system
          req.session.user = user; // Set session for the admin
          return res.redirect('/admin/dashboard'); // Redirect to admin's dashboard

        default:
          return res.status(403).send('Unauthorized role');
      }
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).send('Error logging in');
    }
  },

  logout: (req, res) => {
    // Destroy the session or token when logging out
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/'); // Redirect to home page after logout
    });
  },
};

module.exports = systemLoginController;
