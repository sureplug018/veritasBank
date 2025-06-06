const User = require('../models/userModel');
const Loan = require('../models/loanModel');
const Transaction = require('../models/transactionModel');
const Card = require('../models/cardModel');
const CardApplication = require('../models/cardApplicationModel');
const Support = require('../models/supportModel');
const Kyc = require('../models/kycModel');
const Wallet = require('../models/walletsModel');
const Bill = require('../models/billModel');

function formatCurrency(amount) {
  return Number(amount).toLocaleString();
}

exports.home = (req, res) => {
  const user = res.locals.user;
  try {
    return res.status(200).render('index', {
      title: 'Home',
      user,
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.aboutUs = (req, res) => {
  const user = res.locals.user;
  try {
    return res.status(200).render('about', {
      title: 'About Us',
      user,
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.contactUs = (req, res) => {
  const user = res.locals.user;
  try {
    return res.status(200).render('contact', {
      title: 'Contact Us',
      user,
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.faq = (req, res) => {
  const user = res.locals.user;
  try {
    return res.status(200).render('faq', {
      title: 'FAQ',
      user,
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.services = (req, res) => {
  const user = res.locals.user;
  try {
    return res.status(200).render('services', {
      title: 'Services',
      user,
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.signUp = (req, res) => {
  try {
    return res.status(200).render('sign-up', {
      title: 'Register',
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.signIn = (req, res) => {
  try {
    return res.status(200).render('sign-in', {
      title: 'Sign In',
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminSignIn = (req, res) => {
  try {
    return res.status(200).render('admin-sign-in', {
      title: 'Admin Sign In',
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.forgotPassword = (req, res) => {
  try {
    return res.status(200).render('forgot-password', {
      title: 'Forgot Password',
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.resetPassword = (req, res) => {
  try {
    return res.status(200).render('reset-password', {
      title: 'Reset Password',
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.notFound = (req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'Oops! The page you are looking for does not exist.',
  });
};

exports.verifyOtp = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(302).render('error');
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(302).render('error');
    }
    return res.status(200).render('verify-otp', {
      title: 'Verify Login',
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    return res.status(200).render('reset-password', {
      title: 'Reset Password',
    });
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.userDashboard = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      return res.status(200).render('userDashboard', {
        title: 'User Dashboard',
        user,
        name: user.firstName + ' ' + user.lastName,
        formatCurrency,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (error) {
    console.log(error);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.addMoney = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      const wallets = await Wallet.find();
      return res.status(200).render('addMoney', {
        title: 'Add Money',
        user,
        wallets,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.transferMoney = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      return res.status(200).render('transfer', {
        title: 'Bank Transfer',
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

// exports.transactionHistory = async (req, res) => {
//   try {
//     const user = res.locals.user;
//     if (!user) {
//       return res.status(302).redirect('/sign-in');
//     }
//     if (user.role === 'user') {
//       const depositHistory = await Transaction.find({
//         user: user.id,
//         type: 'deposit',
//         old: { $ne: true },
//       });
//       return res.status(200).render('depositHistory', {
//         title: 'Deposit History',
//         depositHistory,
//         user,
//       });
//     }

//     return res.status(302).redirect('/sign-in');
//   } catch (err) {
//     return res.status(500).render('error', {
//       title: 'Error',
//       message: 'Something went wrong',
//     });
//   }
// };

exports.interBankTransfer = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      const transferHistory = await Transaction.find({
        user: user.id,
        type: 'transfer',
        gateway: 'Inter-Bank Transfer',
      });
      return res.status(200).render('inter-bank-transfer', {
        title: 'Inter-Bank Transfer',
        transferHistory,
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.localTransfer = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      const transferHistory = await Transaction.find({
        user: user.id,
        type: 'transfer',
        gateway: 'Local Transfer',
      });
      return res.status(200).render('local-transfer', {
        title: 'Local Transfer',
        transferHistory,
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.internationalTransfer = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      const transferHistory = await Transaction.find({
        user: user.id,
        type: 'transfer',
        gateway: 'International Transfer',
      });
      return res.status(200).render('international-transfer', {
        title: 'International Transfer',
        transferHistory,
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.loan = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      const loans = await Loan.find({ user: user.id })
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).render('loan', {
        title: 'Apply For Loan',
        loans,
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.loanHistory = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      const loans = await Loan.find({ user: user.id });
      return res.status(200).render('loanHistory', {
        title: 'Loan History',
        loans,
        user,
        formatCurrency,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.card = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      const card = await Card.findOne({ user: user.id });
      return res.status(200).render('card', {
        title: 'Card Management',
        card,
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.support = (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      return res.status(200).render('support', {
        title: 'Support',
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user) {
      const kyc = await Kyc.findOne({ user: user.id }).sort({ createdAt: -1 });
      return res.status(200).render('profile', {
        title: 'Profile',
        kyc,
        user,
        formatCurrency,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.payBill = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      return res.status(200).render('pay-bill', {
        title: 'Bill Payment',
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    console.log(err);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.billHistory = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'user') {
      const bills = await Bill.find({ user: user.id });
      return res.status(200).render('billHistory', {
        title: 'Bill History',
        bills,
        user,
        formatCurrency,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.transactionHistory = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/');
    }
    if (user.role === 'user') {
      const transactions = await Transaction.find({
        user: user.id,
        old: { $ne: true },
      }).sort({ createdAt: -1 });

      const transactions2 = await Transaction.find({
        old: true,
      }).sort({ date: -1 });
      transactions.push(...transactions2);
      return res.status(200).render('transactionHistory', {
        title: 'Transaction History',
        transactions,
        user,
        formatCurrency,
      });
    }
    return res.status(302).redirect('/');
  } catch (error) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.transactionDetails = async (req, res) => {
  try {
    const user = res.locals.user;
    const { transactionId } = req.params;
    if (!user) {
      return res.status(302).redirect('/');
    }
    if (!transactionId) {
      return res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong',
      });
    }

    if (user.role === 'user') {
      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return res.status(500).render('error', {
          title: 'Error',
          message: 'Something went wrong',
        });
      }
      return res.status(200).render('transactionDetails', {
        title: 'Transaction Details',
        transaction,
        user,
        formatCurrency,
      });
    }
    return res.status(302).redirect('/');
  } catch (error) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.zelle = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/');
    }

    if (user.role === 'user') {
      return res.status(200).render('zelle', {
        title: 'Zelle Transfer',
        user,
      });
    }
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//ADMIN

exports.adminDashboard = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const users = await User.find();
      const pendingTransfers = await Transaction.find({
        type: 'transfer',
        status: 'pending',
      });
      const pendingDeposits = await Transaction.find({
        type: 'deposit',
        status: 'pending',
      });
      const totalDeposits = await Transaction.find({
        type: 'deposit',
        status: 'confirmed',
      });
      const pendingLoans = await Loan.find({
        status: 'pending',
      });
      const pendingCardApplications = await CardApplication.find({
        status: 'pending',
      });
      const pendingSupports = await Support.find();
      return res.status(200).render('adminDashboard', {
        title: 'Admin Dashboard',
        user,
        users,
        pendingTransfers,
        pendingDeposits,
        pendingSupports,
        pendingCardApplications,
        pendingLoans,
        totalDeposits,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminTransferHistory = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const transfers = await Transaction.find({
        type: 'transfer',
        old: { $ne: true },
      }).sort({ createdAt: -1 });
      const transfers2 = await Transaction.find({
        old: true,
        type: 'transfer',
      }).sort({ date: -1 });

      transfers.push(...transfers2);
      return res.status(200).render('adminTransferHistory', {
        title: 'Admin Transfer History',
        user,
        transfers,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminDepositHistory = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const deposits = await Transaction.find({
        type: 'deposit',
        old: { $ne: true },
      }).sort({ createdAt: -1 });
      const deposits2 = await Transaction.find({
        old: true,
        type: 'deposit',
      }).sort({ date: -1 });

      deposits.push(...deposits2);
      return res.status(200).render('adminDepositHistory', {
        title: 'Admin Deposit History',
        user,
        deposits,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminLoanHistory = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const loans = await Loan.find();
      return res.status(200).render('adminLoanHistory', {
        title: 'Admin Deposit History',
        user,
        loans,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminBillHistory = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const bills = await Bill.find();
      return res.status(200).render('adminBillHistory', {
        title: 'Admin Bill History',
        user,
        bills,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminCardApplications = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const applications = await CardApplication.find();
      return res.status(200).render('adminCardApplications', {
        title: 'Admin Card Applications',
        user,
        applications,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminSupports = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const supports = await Support.find();
      return res.status(200).render('adminSupports', {
        title: 'Admin Supports',
        user,
        supports,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminCards = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const cards = await Card.find();
      return res.status(200).render('adminCards', {
        title: 'Cards',
        cards,
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.adminUsers = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const users = await User.find();
      return res.status(200).render('adminUsers', {
        title: 'Users',
        users,
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.sendALlUsersMail = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      return res.status(200).render('adminSendMailToAllUsers', {
        title: 'Send Mail To All Users',
        user,
      });
    }

    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.kyc = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/');
    }
    if (user.role === 'admin') {
      const kycs = await Kyc.find();
      return res.status(200).render('kycManagement', {
        title: 'KYC Management',
        kycs,
        user,
      });
    }
    return res.status(302).redirect('/');
  } catch (error) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.pendingTransfers = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/sign-in');
    }
    if (user.role === 'admin') {
      const transfers = await Transaction.find({
        type: 'transfer',
        old: { $ne: true },
        status: 'pending',
      });
      return res.status(200).render('adminTransferHistory', {
        title: 'Admin Transfer History',
        user,
        transfers,
      });
    }
    return res.status(302).redirect('/sign-in');
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.pendingDeposits = async (req, res) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(302).redirect('/');
    }
    if (user.role === 'admin') {
      const deposits = await Transaction.find({
        type: 'deposit',
        old: { $ne: true },
        status: 'pending',
      });
      return res.status(200).render('adminDepositHistory', {
        title: 'Admin Deposit History',
        user,
        deposits,
      });
    }
    return res.status(302).redirect('/');
  } catch (error) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};
