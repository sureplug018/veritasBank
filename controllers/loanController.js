const Loan = require('../models/loanModel');
const Mail = require('../utilities/notificationEmail');
const User = require('../models/userModel')

exports.applyLoan = async (req, res) => {
  const { amount, duration, interest, description, transactionPin } = req.body;

  if (!amount) {
    return res.status(400).json({
      status: 'fail',
      message: 'Amount is required',
    });
  }

  if (!duration) {
    return res.status(400).json({
      status: 'fail',
      message: 'Duration is required',
    });
  }

  if (!description) {
    return res.status(400).json({
      status: 'fail',
      message: 'Description is required',
    });
  }

  try {
    const user = req.user.id;

    if (
      !transactionPin ||
      transactionPin.length < 4 ||
      transactionPin.length > 4 ||
      isNaN(transactionPin) ||
      req.user.transactionPin !== transactionPin
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Incorrect pin!',
      });
    }
    const loan = await Loan.create({
      user,
      amount,
      duration,
      interest,
      description,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        loan,
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

exports.approveLoan = async (req, res) => {
  const { loanId } = req.params;

  if (!loanId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Loan Id not found',
    });
  }

  try {
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({
        status: 'fail',
        message: 'Loan not found',
      });
    }

    loan.status = 'approved';

    const updatedLoan = await loan.save();

    await User.findByIdAndUpdate(
      loan.user,
      {
        $inc: { loan: Number(loan.amount) }, // Ensure amount is a number
      },
      { new: true, runValidators: true }
    ); // Return updated user & enforce validation

    // send email on loan approval
    const subject = 'Credit Card Approved';
    const user = User.findById(loan.user.id)
    await new Mail(user, subject, updatedLoan).approveLoanEmail();

    return res.status(200).json({
      status: 'success',
      data: {
        updatedLoan,
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

exports.declineLoan = async (req, res) => {
  const { loanId } = req.params;

  if (!loanId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Loan Id not found',
    });
  }

  try {
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({
        status: 'fail',
        message: 'Loan not found',
      });
    }

    loan.status = 'declined';

    const updatedLoan = await loan.save();

    // send email when loan is declined
    // it will be done manually

    return res.status(200).json({
      status: 'success',
      data: {
        updatedLoan,
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
// In the code snippet above, we created a loan controller with the following functions:
// createLoan: This function creates a new loan application.
// approveLoan: This function approves a loan application.
// declineLoan: This function declines a loan application.
