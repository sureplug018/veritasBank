const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.get('/get-account/:accountNumber', transactionController.getAccount);
router.post('/deposit', transactionController.deposit);

router.post('/transfer', transactionController.transfer);

router.post('/zelle', transactionController.zelleTransfer);

router.use(authController.restrictTo('admin'));

router.patch(
  '/approve-transaction/:transactionId',
  transactionController.approveTransaction
);

router.patch(
  '/decline-transaction/:transactionId',
  transactionController.declineTransaction
);

router.post('/direct-deposit/:userId', transactionController.directDeposit);

router.patch(
  '/admin/edit-transaction/:transactionId',
  transactionController.adminEditTransaction
);

module.exports = router;
