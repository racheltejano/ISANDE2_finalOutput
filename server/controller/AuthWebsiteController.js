const bcrypt = require('bcrypt');
const supabaseClient = require('../database/supabaseClient');

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
      if (user.role_id !== 1) {
        // Only customers (role_id: 1) are allowed to log in to the website
        return res.status(403).send('Access restricted to customers only');
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
    // Destroy the session or token when logging out
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/'); // Redirect to home page after logout
    });
  },
};

module.exports = authWebsiteController;
