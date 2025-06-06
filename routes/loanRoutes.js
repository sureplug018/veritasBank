const express = require('express');
const loanController = require('../controllers/loanController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post('/apply-for-loan', loanController.applyLoan);
router.patch(
  '/approve-loan/:loanId',
  authController.restrictTo('admin'),
  loanController.approveLoan
);
router.patch(
  '/decline-loan/:loanId',
  authController.restrictTo('admin'),
  loanController.declineLoan
);

module.exports = router;
