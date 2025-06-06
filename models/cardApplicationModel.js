const mongoose = require('mongoose');

const cardApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    cardType: {
      type: String,
      required: [true, 'A card application must have a card type'],
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

cardApplicationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email',
  });
  next();
});

const CardApplication = mongoose.model(
  'CardApplication',
  cardApplicationSchema
);
module.exports = CardApplication;
// In the code snippet above, we created a card application schema with the following fields:
