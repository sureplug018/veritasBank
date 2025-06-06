const mongoose = require('mongoose');
const crypto = require('crypto');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: [true, 'A transaction must have an amount'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['deposit', 'transfer', 'system'],
    },
    gateway: {
      type: String,
      required: true,
    },
    wallet: String,
    cardNumber: {
      type: Number,
    },
    cvv: {
      type: Number,
    },
    cardName: {
      type: String,
    },
    expiryDate: {
      type: String,
    },
    old: {
      type: Boolean,
      default: false, // true if the transaction is old
    },
    address: String,
    paymentProof: String,
    description: String,
    receiverName: String,
    accountNumber: String,
    IBAN: String,
    swiftCode: String,
    bankName: String,
    address: String,
    BIC: String,
    sortCode: String,
    routingNumber: String,
    accountType: String,
    date: Date,
  },
  {
    timestamps: true,
  }
);

transactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = crypto.randomBytes(10).toString('hex');
  }
  next();
});

transactionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email accountNumber',
  });
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
