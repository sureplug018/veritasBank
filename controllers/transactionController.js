const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const Mail = require('../utilities/notificationEmail');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let transformation = [];
    let folder;
    let public_id;
    let allowed_formats;

    if (file.fieldname === 'paymentProof') {
      folder = 'covers';
      public_id = `cover-${Date.now()}`;
      allowed_formats = ['jpg', 'jpeg', 'png'];
      if (file.mimetype.startsWith('image')) {
        transformation = [{ width: 500, height: 500, crop: 'limit' }];
      }
    }

    return {
      folder,
      allowed_formats,
      transformation,
      public_id,
    };
  },
});

// Multer middleware to handle multiple fields
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB per file
}).fields([
  { name: 'paymentProof', maxCount: 1 }, // Single file for front
]);

// Middleware to handle the upload
// Middleware function to handle file uploads and errors
exports.uploadPaymentProof = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'fail',
          message: 'File size should not exceed 10MB',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          status: 'fail',
          message: 'Limit expected',
        });
      }
      if (err.message === 'An unknown file format not allowed') {
        return res.status(400).json({
          status: 'fail',
          message: 'Unsupported  file  format',
        });
      }
    } else if (err) {
      // Handle general errors
      console.log(err);
      return res.status(500).json({
        status: 'fail',
        message: err.message,
      });
    }

    // Proceed if no errors
    next();
  });
};

exports.deposit = async (req, res) => {
  const {
    amount,
    gateway,
    wallet,
    address,
    cvv,
    cardName,
    cardNumber,
    expiryDate,
    transactionPin,
  } = req.body;

  if (!gateway) {
    return res.status(400).json({
      status: 'fail',
      message: 'Select a gateway',
    });
  }

  if (gateway === 'Crypto') {
    if (!wallet) {
      return res.status(400).json({
        status: 'fail',
        message: 'Wallet is required',
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount is required',
      });
    }
  }

  if (gateway === 'Credit Card') {
    if (!cardNumber || !cvv || !cardName || !expiryDate || !address) {
      return res.status(400).json({
        status: 'fail',
        message: 'Card details are required',
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount is required',
      });
    }
  }

  if (gateway === 'Transfer') {
    if (!amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount is required',
      });
    }
  }

  const type = 'deposit';
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

    const transaction = await Transaction.create({
      user,
      amount,
      gateway,
      wallet,
      address,
      type,
      cvv,
      cardName,
      cardNumber,
      expiryDate,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};

exports.transfer = async (req, res) => {
  const {
    gateway,
    amount,
    receiverName,
    accountNumber,
    IBAN,
    swiftCode,
    wallet,
    bankName,
    address,
    sortCode,
    description,
    routingNumber,
    accountType,
    transactionPin,
  } = req.body;

  if (!gateway) {
    return res.status(400).json({
      status: 'fail',
      message: 'Select a gateway',
    });
  }

  // Inter-bank transfer
  if (gateway === 'Inter-Bank Transfer') {
    if (!accountNumber) {
      return res.status(400).json({
        status: 'fail',
        message: 'Account number is required',
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount is required',
      });
    }
  }

  // Local bank transfer
  if (gateway === 'Local Transfer') {
    if (!accountNumber) {
      return res.status(400).json({
        status: 'fail',
        message: 'Account number is required',
      });
    }

    // if (!sortCode) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'Sort code is required',
    //   });
    // }

    if (!address) {
      return res.status(400).json({
        status: 'fail',
        message: 'Address is required',
      });
    }

    if (!routingNumber) {
      return res.status(400).json({
        status: 'fail',
        message: 'Routing number is required',
      });
    }

    if (!accountType) {
      return res.status(400).json({
        status: 'fail',
        message: 'Account type is required',
      });
    }

    if (!receiverName) {
      return res.status(400).json({
        status: 'fail',
        message: 'Receiver name is required',
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount is required',
      });
    }
  }

  // International transfer
  if (gateway === 'International Transfer') {
    if (!IBAN) {
      return res.status(400).json({
        status: 'fail',
        message: 'IBAN is required',
      });
    }

    if (!receiverName) {
      return res.status(400).json({
        status: 'fail',
        message: 'Receiver name is required',
      });
    }

    if (!swiftCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'BIC or swift code is required',
      });
    }

    if (!bankName) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bank name is required',
      });
    }

    if (!address) {
      return res.status(400).json({
        status: 'fail',
        message: 'Address is required',
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount is required',
      });
    }
  }

  if (gateway === 'Crypto') {
    if (!wallet) {
      return res.status(400).json({
        status: 'fail',
        message: 'Wallet name is required',
      });
    }

    if (!address) {
      return res.status(400).json({
        status: 'fail',
        message: 'Wallet Address is required',
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount is required',
      });
    }
  }

  if (!description) {
    return res.status(400).json({
      status: 'fail',
      message: 'Description is required',
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (
      !transactionPin ||
      transactionPin.length < 4 ||
      transactionPin.length > 4 ||
      isNaN(transactionPin) ||
      req.user.transactionPin !== transactionPin
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid transaction pin',
      });
    }

    if (Number(amount) > user.balance) {
      return res.status(400).json({
        status: 'fail',
        message: 'Low Balance',
      });
    }

    let transaction;

    if (gateway === 'Inter-Bank Transfer') {
      const account = await User.findOne({
        accountNumber,
      });

      if (!account) {
        return res.status(404).json({
          status: 'fail',
          message: 'Invalid account number',
        });
      }

      transaction = await Transaction.create({
        user: user.id,
        gateway,
        amount,
        accountNumber,
        description,
        type: 'transfer',
        status: 'confirmed',
      });

      account.balance = account.balance + Number(amount);
      await account.save();

      user.balance = user.balance - Number(amount);
      await user.save();

      // notify the two users of the transfer
      //notify the user that the transfer have been approved
      const subject = 'Transaction Successful';
      await new Mail(
        user,
        subject,
        transaction
      ).notifyUserOnSuccessfulTransaction();

      await new Mail(
        account,
        subject,
        transaction
      ).notifyUserOnSuccessfulTransaction();

      return res.status(200).json({
        status: 'success',
        data: {
          transaction,
        },
      });
    }

    const transferStatus = user.transferStatus;

    transaction = await Transaction.create({
      user: user.id,
      gateway,
      amount,
      receiverName,
      accountNumber,
      IBAN,
      swiftCode,
      bankName,
      wallet,
      address,
      sortCode,
      description,
      routingNumber,
      accountType,
      status: transferStatus === true ? 'pending' : 'confirmed',
      type: 'transfer',
    });

    user.balance = user.balance - Number(amount);
    await user.save();
    // notify the user of the transfer

    //notify the admin of the transfer
    const admins = await User.find({ role: 'admin' });
    const emailPromises = admins.map((user) => {
      const subject = 'New Transaction';
      return new Mail(
        user,
        subject,
        transaction
      ).notifyUserOnSuccessfulTransaction();
    });

    await Promise.all(emailPromises);
    return res.status(200).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};

exports.zelleTransfer = async (req, res) => {
  const { email, amount, transactionPin } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'fail',
      message: 'Enter email or phone number of the receiver',
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (
      !transactionPin ||
      transactionPin.length < 4 ||
      transactionPin.length > 4 ||
      isNaN(transactionPin) ||
      req.user.transactionPin !== transactionPin
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid transaction pin',
      });
    }

    if (Number(amount) > user.balance) {
      return res.status(400).json({
        status: 'fail',
        message: 'Low Balance',
      });
    }
    const transferStatus = user.transferStatus;
    const transaction = await Transaction.create({
      user,
      receiverName: email,
      type: 'transfer',
      gateway: 'Zelle',
      status: transferStatus === true ? 'pending' : 'confirmed',
      amount,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};

exports.directDeposit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, type, wallet } = req.body;

    if (!amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Amount is required',
      });
    }

    if (!type) {
      return res.status(400).json({
        status: 'fail',
        message: 'Transaction type is required',
      });
    }

    if (!wallet) {
      return res.status(400).json({
        status: 'fail',
        message: 'Wallet is required',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    if (type === 'add' && wallet === 'balance') {
      user.balance += Number(amount);
    }

    if (type === 'add' && wallet === 'savings') {
      user.savings += Number(amount);
    }

    if (type === 'add' && wallet === 'loan') {
      user.loan += Number(amount);
    }

    if (type === 'subtract' && wallet === 'balance') {
      user.balance -= Number(amount);
    }

    if (type === 'subtract' && wallet === 'savings') {
      user.savings -= Number(amount);
    }

    if (type === 'subtract' && wallet === 'loan') {
      user.loan -= Number(amount);
    }

    await user.save();

    const newTransaction = await Transaction.create({
      user: user.id,
      type: type === 'add' ? 'deposit' : 'transfer',
      gateway: 'system',
      address: 'null',
      amount,
      status: 'confirmed',
      wallet: 'null',
      paymentProof: 'null',
    });

    const subject = 'Transaction Successful!';

    await new Mail(user, subject, newTransaction).directDeposit();

    return res.status(200).json({
      status: 'success',
      data: {
        transaction: 'Success',
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.approveTransaction = async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Transaction Id not found',
    });
  }

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction not found',
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot perform this action here',
      });
    }

    if (transaction.type === 'deposit') {
      const user = await User.findById(transaction.user);
      user.balance = user.balance + transaction.amount;
      await user.save();
    }

    if (
      transaction.type === 'transfer' &&
      (transaction.gateway === 'International Transfer' ||
        transaction.gateway === 'Local Transfer')
    ) {
      const user = await User.findById(transaction.user);
      user.balance = user.balance - transaction.amount;
      await user.save();
    }

    transaction.status = 'confirmed';

    const updatedTransaction = await transaction.save();

    //notify the user that the transfer have been approved
    const subject = 'Transaction Successful';
    await new Mail(
      transaction.user,
      subject,
      transaction
    ).notifyUserOnSuccessfulTransaction();

    return res.status(200).json({
      status: 'success',
      data: {
        updatedTransaction,
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

exports.declineTransaction = async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Transaction Id not found',
    });
  }

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction not found',
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot perform this action here',
      });
    }

    transaction.status = 'declined';

    const updatedTransaction = await transaction.save();

    // notify the user that the transfer was declined
    // this will be done manually

    return res.status(200).json({
      status: 'success',
      data: {
        updatedTransaction,
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

exports.getAccount = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const account = await User.findOne({
      accountNumber,
    });
    if (account) {
      return res.status(200).json({
        status: 'success',
        data: {
          account,
        },
      });
    } else {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid account number',
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.adminEditTransaction = async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Transaction Id not found',
    });
  }

  const { amount, type, gateway, time, status, date } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction not found',
      });
    }

    if (amount) {
      transaction.amount = amount;
    }

    if (type) {
      transaction.type = type;
    }

    if (gateway) {
      transaction.gateway = gateway;
    }

    if (time) {
      transaction.old = time;
    }

    if (status) {
      transaction.status = status;
    }

    if (date) {
      const [day, month, year] = date.split('/');
      const currentTime = new Date();
      transaction.date = new Date(
        `${year}-${month}-${day}T${currentTime.toTimeString().split(' ')[0]}`
      );
    }

    const updatedTransaction = await transaction.save();

    return res.status(200).json({
      status: 'success',
      data: {
        updatedTransaction,
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
