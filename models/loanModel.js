const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A loan must have a user'],
    },
    amount: {
      type: Number,
      required: [true, 'A loan must have an amount'],
    },
    duration: {
      type: Number,
      required: [true, 'A loan must have a duration'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    // interest: {
    //   type: Number,
    //   required: true,
    // },
    description: String,
  },
  {
    timestamps: true,
  }
);

loanSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email',
  });
  next();
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
// In the code snippet above, we created a loan schema with the following fields:
