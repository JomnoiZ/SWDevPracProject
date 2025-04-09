const express = require('express');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// TODO: add routes for massage reservation
// TODO: give access RUD to admin after finishing the routes

module.exports = router;