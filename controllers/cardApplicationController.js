const CardApplication = require('../models/cardApplicationModel');
const Card = require('../models/cardModel');
const User = require('../models/userModel');
const Mail = require('../utilities/notificationEmail');

exports.createCardApplication = async (req, res) => {
  const {
    cardType,
    name,
    email,
    phoneNumber,
    address,
    zipCode,
    country,
    amount,
    transactionPin,
  } = req.body;

  if (!cardType) {
    return res.status(400).json({
      status: 'fail',
      message: 'Card type is required',
    });
  }

  if (!name) {
    return res.status(400).json({
      status: 'fail',
      message: 'Full Name is required',
    });
  }

  if (!email) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email is required',
    });
  }

  if (!phoneNumber) {
    return res.status(400).json({
      status: 'fail',
      message: 'Phone Number is required',
    });
  }

  if (!address) {
    return res.status(400).json({
      status: 'fail',
      message: 'Home Address is required',
    });
  }

  if (!zipCode) {
    return res.status(400).json({
      status: 'fail',
      message: 'Zip Code is required',
    });
  }

  if (!country) {
    return res.status(400).json({
      status: 'fail',
      message: 'Country is required',
    });
  }

  if (!amount) {
    return res.status(400).json({
      status: 'fail',
      message: 'Amount is required',
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (Number(amount) > user.balance) {
      return res.status(400).json({
        status: 'fail',
        message: 'Low balance! Top up your balance',
      });
    }

    if (
      !transactionPin ||
      transactionPin.length < 4 ||
      transactionPin.length > 4 ||
      isNaN(transactionPin) ||
      user.transactionPin !== transactionPin
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Incorrect pin!',
      });
    }

    const cardApplication = await CardApplication.create({
      user,
      cardType,
      name,
      email,
      phoneNumber,
      address,
      zipCode,
      country,
      amount,
    });

    user.balance = user.balance - Number(amount);

    await user.save();

    //notify the admin that a user requested for card

    const admins = await User.find({ role: 'admin' });

    const emailPromises = admins.map((user) => {
      const subject = 'New Card Application';
      return new Mail(
        user,
        subject,
        cardApplication
      ).notifyAdminOnCardApplication();
    });

    await Promise.all(emailPromises);

    return res.status(200).json({
      status: 'success',
      data: {
        cardApplication,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.declineCard = async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Card Id not found',
    });
  }

  try {
    const card = await CardApplication.findById(applicationId);

    if (!card) {
      return res.status(404).json({
        status: 'fail',
        message: 'Card not found',
      });
    }

    card.status = 'declined';

    const updatedCard = await card.save();

    // notify the user that the card application was declined
    // this will be done manually, not here

    return res.status(200).json({
      status: 'success',
      data: {
        updatedCard,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.approveCard = async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Card Id is required',
    });
  }

  try {
    const card = await CardApplication.findById(applicationId);

    if (!card) {
      return res.status(404).json({
        status: 'fail',
        message: 'Card not found',
      });
    }

    card.status = 'approved';

    await card.save();

    let cardNumber;
    // Generate a 16-digit numeric card number
    if (card.cardType === 'Master Card') {
      cardNumber =
        '5' +
        Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join(
          ''
        );
    } else if (card.cardType === 'Visa Card') {
      cardNumber =
        '4' +
        Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join(
          ''
        );
    }

    // Generate a 3-digit numeric CVV
    const cvv = String(Math.floor(100 + Math.random() * 900)); // Ensures a 3-digit number

    // Generate expiry date (4 years from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);

    const newCard = await Card.create({
      user: card.user,
      cardType: card.cardType,
      cardNumber,
      cvv,
      expiryDate, // Storing a Date object, not a string
    });

    //send email to notify the user
    const subject = 'Credit Card Approved';
    const user = await User.findById(card.user);
    await new Mail(user, subject, newCard).approveCardEmail();

    return res.status(200).json({
      status: 'success',
      data: {
        newCard,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};
