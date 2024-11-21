const express = require('express');
const router = express.Router();
const systemLoginController = require('../controller/systemLoginController');

// Login route
router.post('/login', systemLoginController.login);

// Logout route
router.get('/logout', systemLoginController.logout);

module.exports = router;