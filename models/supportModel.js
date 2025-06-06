const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'A support mail must have a user'],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    subject: {
      type: String,
      required: [true, 'A support mail must have a subject'],
    },
    message: {
      type: String,
      required: [true, 'A support mail must have a message'],
    },
    status: {
      type: String,
      required: [true, 'A support mail must have a status'],
      enum: ['pending', 'replied'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

supportSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'firstName lastName email',
  });
  next();
});

const Support = mongoose.model('Support', supportSchema);

module.exports = Support;
