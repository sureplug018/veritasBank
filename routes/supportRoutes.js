const express = require('express');
const authController = require('../controllers/authController');
const supportController = require('../controllers/supportController');

const router = express.Router();

router.post('/send-support', supportController.createSupport);

router.use(authController.protect);

router.post(
  '/reply-support/:supportId',
  authController.restrictTo('admin'),
  supportController.replySupport
);

router.post(
  '/send-mail/:id',
  authController.restrictTo('admin'),
  supportController.sendMail
);

router.delete(
  '/delete-support/:supportId',
  authController.restrictTo('admin'),
  supportController.deleteSupport
);

router.post(
  '/send-mail-to-all-users',
  authController.restrictTo('admin'),
  supportController.sendMailToAllUsers
);

module.exports = router;
