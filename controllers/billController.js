const Bill = require('../models/billModel');
const User = require('../models/userModel');

exports.payBill = async (req, res) => {
  const { type, specification, amount, transactionPin } = req.body;

  if (!type) {
    return res.status(400).json({
      status: 'fail',
      message: 'Select bill type',
    });
  }

  if (!specification) {
    return res.status(400).json({
      status: 'fail',
      message: 'Enter  bill specification',
    });
  }

  if (!amount) {
    return res.status(400).json({
      status: 'fail',
      message: 'Enter bil amount',
    });
  }

  try {
    const user = await User.findById(req.user.id);

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

    if (Number(amount) > user.balance) {
      return res.status(400).json({
        status: 'fail',
        message: 'Low balance! top up your account balance and try again.',
      });
    }

    user.balance -= Number(amount);
    await user.save();

    const newBill = await Bill.create({
      user: user.id,
      type,
      specification,
      amount,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        newBill,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};
