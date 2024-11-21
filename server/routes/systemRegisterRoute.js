// server/routes/systemRegisterRoute.js

const express = require('express');
const router = express.Router();
const systemRegisterController = require('../controller/systemRegisterController'); // Assuming the controller exists

//WORKING ALREADY DO NOT TOUCH

// Render the system registration page when the GET request is made
router.get('/register', (req, res) => {
    res.render('systemRegister'); // Correct view name for system registration page
});

// Handle POST request to /register for system registration
router.post('/register', systemRegisterController.registerSeller); // Handle the form submission

module.exports = router;
