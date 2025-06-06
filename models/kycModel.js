const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    front: {
      type: String,
      required: true,
    },
    back: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Unverified', 'Verified'],
      default: 'Pending',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

kycSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email',
  });
  next();
});

const Kyc = mongoose.model('Kyc', kycSchema);

module.exports = Kyc;
