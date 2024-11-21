// server/routes/websiteRegisterRoute.js
//WORKING ALREADY DO NOT TOUCH

const express = require('express');
const router = express.Router();
const websiteRegisterController = require('../controller/websiteRegisterController');

// Render the website registration page when the GET request is made
router.get('/register', (req, res) => {
    res.render('websiteRegister'); // Correct view name
});

// Handle POST request to /register
router.post('/register', websiteRegisterController.registerUser); // Handle the form submission

module.exports = router;
