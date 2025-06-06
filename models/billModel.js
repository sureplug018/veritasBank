const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
    },
    specification: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'Success',
    },
  },
  {
    timestamps: true,
  }
);

billSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email',
  });
  next();
});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
