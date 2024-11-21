const express = require('express');
const router = express.Router();
const AuthWebsiteController = require('../controller/AuthWebsiteController');

//WORKING ALREADY DO NOT TOUCH

// GET route to render the login page
router.get('/', (req, res) => {
    res.render('websiteLogin', { pageTitle: 'Website Login Page' });
});

// Login route
router.post('/', AuthWebsiteController.login);

// Logout route
router.get('/websitelogout', AuthWebsiteController.logout);

module.exports = router;
