const express = require('express');
const authController = require('../controllers/authController');
const billController = require('../controllers/billController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.post('/pay-bill', billController.payBill);

module.exports = router;
