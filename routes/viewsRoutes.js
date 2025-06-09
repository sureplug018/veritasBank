const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/sign-up', viewsController.signUp);

router.get('/sign-in', viewsController.signIn);

router.get('/admin/sign-in', viewsController.adminSignIn);

router.get('/forgot-password', viewsController.forgotPassword);

router.get('/reset-password/:token', viewsController.resetPassword);

router.get('/verify-otp/:userId', viewsController.verifyOtp);

router.use(authController.isLoggedIn);

router.get('/', viewsController.home);

router.get('/about-us', viewsController.aboutUs);

router.get('/contact-us', viewsController.contactUs);

router.get('/faq', viewsController.faq);

router.get('/services', viewsController.services);

router.get('/loans', viewsController.loans);

router.get('/credit-cards', viewsController.creditCard);

router.get('/security', viewsController.security);

router.get('/terms-of-service', viewsController.terms);

router.get('/privacy-policy', viewsController.privacy);

router.get('/dashboard', viewsController.userDashboard);

router.get('/history/transactions', viewsController.transactionHistory);

router.get('/deposit', viewsController.addMoney);

router.get('/transfer', viewsController.transferMoney);

router.get('/history/inter-bank-transfer', viewsController.interBankTransfer);

router.get('/history/local-transfer', viewsController.localTransfer);

router.get(
  '/history/international-transfer',
  viewsController.internationalTransfer
);

router.get('/history/deposit', viewsController.transactionHistory);

router.get('/loan', viewsController.loan);

router.get('/history/loan', viewsController.loanHistory);

router.get('/card-management', viewsController.card);

router.get('/support', viewsController.support);

router.get('/profile', viewsController.profile);

router.get('/pay-bills', viewsController.payBill);

router.get('/history/bill', viewsController.billHistory);

router.get(
  '/history/transactions/:transactionId',
  viewsController.transactionDetails
);

router.get('/zelle', viewsController.zelle);

///////////////////   ADMIN     /////////////////////////
router.get('/admin/dashboard', viewsController.adminDashboard);

router.get('/admin/history/transfer', viewsController.adminTransferHistory);

router.get('/admin/history/deposit', viewsController.adminDepositHistory);

router.get('/admin/history/loan', viewsController.adminLoanHistory);

router.get('/admin/history/bill', viewsController.adminBillHistory);

router.get('/admin/card-applications', viewsController.adminCardApplications);

router.get('/admin/supports', viewsController.adminSupports);

router.get('/admin/cards', viewsController.adminCards);

router.get('/admin/users', viewsController.adminUsers);

router.get('/admin/send-mail', viewsController.sendALlUsersMail);

router.get('/admin/kyc-management', viewsController.kyc);

router.get('/admin/pending-deposits', viewsController.pendingDeposits);

router.get('/admin/pending-transfers', viewsController.pendingTransfers);

// redirect unknown routes
// router.use(viewsController.notFound);

module.exports = router;
