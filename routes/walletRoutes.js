const express = require('express');
const authController = require('../controllers/authController');
const walletController = require('../controllers/walletController');

const router = express.Router();

router
  .route('/create-wallet')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    walletController.createWallet
  );

router
  .route('/delete-wallet/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    walletController.deleteWallet
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    walletController.getAllWallets
  );

router
  .route('/edit-wallet/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    walletController.editWallet
  );
router
  .route('/get-address/:walletName')
  .get(authController.protect, walletController.getWalletAddress);

module.exports = router;
