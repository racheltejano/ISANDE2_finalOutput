const express = require('express');
const router = express.Router();
const AuthWebsiteController = require('../controller/AuthWebsiteController');

// Login route
router.post('/login', AuthWebsiteController.login);

// Logout route
router.get('/logout', AuthWebsiteController.logout);

module.exports = router;
