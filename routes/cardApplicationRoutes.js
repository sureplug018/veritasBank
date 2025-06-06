const express = require('express');
const authController = require('../controllers/authController');
const cardApplicationController = require('../controllers/cardApplicationController');

const router = express.Router();

router.use(authController.protect);

router.post(
  '/create-card-application',
  authController.restrictTo('user'),
  cardApplicationController.createCardApplication
);

router.patch(
  '/decline-card-application/:applicationId',
  authController.restrictTo('admin'),
  cardApplicationController.declineCard
);

router.patch(
  '/approve-card-application/:applicationId',
  authController.restrictTo('admin'),
  cardApplicationController.approveCard
);

module.exports = router;
