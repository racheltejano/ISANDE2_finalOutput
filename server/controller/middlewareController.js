const supabase = require('../database/supabaseClient'); // Import Supabase client

//Protect Route Middleware to ensure the user is authenticated
const protectRoute = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.session || !req.session.user) {
        return res.redirect('/login');
      }
  
      const userRole = req.session.user.roles.toString(); // Convert to string for comparison
  
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).send('Access Forbidden');
      }
  
      next();
    };
  };

module.exports = protectRoute;
