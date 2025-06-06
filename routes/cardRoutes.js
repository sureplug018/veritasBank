const express = require('express');
const authController = require('../controllers/authController');
const cardController = require('../controllers/cardController');

const router = express.Router();

router.use(authController.protect);

router.patch('/freeze-card/:cardId', cardController.freezeCard);
router.patch('/unfreeze-card/:cardId', cardController.unFreezeCard);

module.exports = router;
