const nodemailer = require('nodemailer');
const Support = require('../models/supportModel');
const Mail = require('./../utilities/notificationEmail');
const User = require('../models/userModel');

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

exports.createSupport = async (req, res) => {
  const { fullName, subject, message } = req.body;
  const requiredFields = ['fullName', 'subject', 'message'];

  // Validate request body
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res
        .status(400)
        .json({ status: 'fail', message: `${field} is required` });
    }
  }
  try {
    const userId = req.user.id;
    const support = await Support.create({
      userId,
      fullName,
      subject,
      message,
    });

    return res.status(201).json({
      status: 'success',
      data: {
        support,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.replySupport = async (req, res) => {
  const { supportId } = req.params;
  const { subject, message } = req.body;

  try {
    // Find the support message by email
    const support = await Support.findById(supportId);
    const email = support.userId.email;

    if (!support) {
      return res.status(404).json({
        status: 'fail',
        message: 'Support message not found',
      });
    }

    // Send a reply email to the user
    await sendReplyEmail(email, subject, message);

    // Delete the support message
    await Support.findByIdAndDelete(support._id);

    return res.status(200).json({
      status: 'success',
      message: 'Reply sent and support message deleted',
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

async function sendReplyEmail(email, subject, message) {
  const mailOptions = {
    from: '"Verittas Bank" <support@verittasfounders.com>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: `<p>${message}</p>`, // html body
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw new Error('Failed to send email');
  }
}

exports.sendMail = async (req, res) => {
  const id = req.params.id;
  const { subject, message } = req.body;

  try {
    // Find the support message by email
    const user = await User.findById({ _id: id });
    // const email = user.email;

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Send a reply email to the user
    await new Mail(user, subject, message).sendMailToAllUsers();

    return res.status(200).json({
      status: 'success',
      message: 'Message Sent',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.sendMailToAllUsers = async (req, res) => {
  const { subject, message } = req.body;

  if (!subject) {
    return res.status(400).json({
      status: 'fail',
      message: 'subject is required',
    });
  }

  if (!message) {
    return res.status(400).json({
      status: 'fail',
      message: 'message is required',
    });
  }

  try {
    const users = await User.find({ role: 'user' });

    const emailPromises = users.map((user) => {
      return new Mail(user, subject, message).sendMailToAllUsers();
    });

    await Promise.all(emailPromises);

    return res.status(200).json({
      status: 'success',
      message: 'Message Sent',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteSupport = async (req, res) => {
  const { supportId } = req.params;

  if (!supportId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Support Id is required',
    });
  }

  try {
    const support = await Support.findById(supportId);

    if (!support) {
      return res.status(404).json({
        status: 'fail',
        message: 'Support not found',
      });
    }

    await Support.findByIdAndDelete(supportId);

    return res.status(200).json({
      status: 'success',
      message: 'Support deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};
