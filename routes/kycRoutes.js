const express = require('express');
const authController = require('../controllers/authController');
const kycController = require('../controllers/kycController');

const router = express.Router();

router.use(authController.protect);

router.post(
  '/upload-kyc',
  authController.restrictTo('user'),
  kycController.uploadFiles,
  kycController.uploadKyc
);

router.use(authController.restrictTo('admin'));

router.patch('/approve-kyc/:kycId', kycController.approveKyc);

router.patch('/decline-kyc/:kycId', kycController.declineKyc);

module.exports = router;
