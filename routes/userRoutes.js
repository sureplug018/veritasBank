const express = require('express');
const authController = require('../controllers/authController');
const transactionController = require('./../controllers/transactionController');

const router = express.Router();

router.post(
  '/signup',
  transactionController.uploadPaymentProof,
  authController.signup
);

router.post('/confirm-email/:token/', authController.confirmEmailBE);

router.post('/login', authController.login);

router.post('/login/admin', authController.loginAdmin);

router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.post('/verify-otp/:userId', authController.verifyOtp);

// Assuming '/update' is the route where user data can be updated
router.patch(
  '/update',
  authController.protect,
  transactionController.uploadPaymentProof,
  authController.updateUserData
);

router.delete(
  '/deleteUser/:id',
  authController.protect,
  authController.restrictTo('admin'),
  authController.deleteUser
);

router.patch(
  '/admin-edit-user-data/:userId',
  authController.protect,
  authController.restrictTo('admin'),
  authController.adminEditUserData
);

router.patch(
  '/deactivate-account/:userId',
  authController.protect,
  authController.restrictTo('admin'),
  authController.deactivateUserAccount
);

router.patch(
  '/activate-account/:userId',
  authController.protect,
  authController.restrictTo('admin'),
  authController.activateUserAccount
);

router.patch(
  '/deactivate-transfer/:userId',
  authController.protect,
  authController.restrictTo('admin'),
  authController.deActivateUserTransfer
);

router.patch(
  '/activate-transfer/:userId',
  authController.protect,
  authController.restrictTo('admin'),
  authController.activateUserTransfer
);

router.post('/resend-otp/:userId', authController.resendOtp);

module.exports = router;
