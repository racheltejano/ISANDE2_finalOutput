const express = require('express');
const router = express.Router();
const systemLoginController = require('../controller/systemLoginController');

//WORKING ALREADY DO NOT TOUCH

// GET route to render the login page
router.get('/', (req, res) => {
    res.render('systemLogin', { pageTitle: 'System Login Page' });
});

// Login route
router.post('/', systemLoginController.login);

// Logout route
router.get('/systemlogout', systemLoginController.logout);

module.exports = router;
