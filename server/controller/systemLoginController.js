const bcrypt = require('bcrypt');
const supabaseClient = require('../database/supabaseClient');

//WORKING ALREADY DO NOT TOUCH

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
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        console.error('User not found or error fetching user:', error);
        return res.status(401).send('Invalid username or password');
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send('Invalid username or password');
      }

      if (user.role_id === 2 && user.approval_status == false) {
        // Send a response indicating that the seller is pending approval
        return res.status(403).send('Your seller account is pending approval. Please wait for admin approval.');
      }
      
      // Check the user's role and proceed accordingly
      if (user.role_id !== 2 && user.role_id !== 3) {
        return res.status(403).send('Access restricted to authorized users only.');
      }

      // Set session for the user
      req.session.user = user; // Store user info in the session

      // Redirect the user to their respective dashboard or home page
      return res.redirect('/dashboard'); 

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
