const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, 'A user must have a first name'],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, 'A user must have a last name'],
    },
    middleName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: 'Invalid email address',
      },
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: [true, 'A user must have a role'],
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return value.length >= 8;
        },
        message: 'Passwords must be up to 8 characters',
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Password does not match',
      },
    },
    username: {
      type: String,
      required: [true, 'A user must have a username'],
    },
    transferStatus: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 0,
    },
    loan: {
      type: Number,
      default: 0,
    },
    savings: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
      required: true,
    },
    gender: String,
    confirmationTokenExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    confirmationToken: String,
    createdAt: Date,
    phoneNumber: {
      type: String,
      required: [true, 'A user must have a phone a phone number'],
    },
    myReferralCode: {
      type: String,
      unique: true,
    },
    referral: String,
    referralsNumber: {
      type: Number,
      default: 0,
    },
    kyc: {
      type: Boolean,
      default: false,
    },
    paymentProof: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    city: String,
    zip: String,
    address: String,
    dateOfBirth: String,
    status: {
      type: Boolean,
      default: true,
    },
    transactionPin: {
      type: String,
      required: true,
    },
    depositStatus: {
      type: Boolean,
      default: true,
    },
    withdrawalStatus: {
      type: Boolean,
      default: true,
    },
    sendMoneyStatus: {
      type: Boolean,
      default: true,
    },
    kycStatus: {
      type: Boolean,
      default: false,
    },
    accountNumber: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpCreatedAt: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//creating a timestamp for each time password is changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passswordChangedAt = Date.now() - 1000;
  next();
});

// hashing and salting password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

// comparing provided password with the one saved in database before logging user in
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// comparing the timestamp date with the date of token generation when the timestamp is greater than when the token was generated
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passswordChangedAt) {
    const changedTimestamp = parseInt(
      this.passswordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// generating password reset token and setting time for expiration
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// adding timestamp to any created document
userSchema.pre('save', function (next) {
  this.createdAt = Date.now();
  next();
});

// Define the function outside of the middleware to generate referral code
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset.charAt(randomIndex);
  }
  return randomString;
}

// Function to generate a random 10-digit account number
const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Ensures a 10-digit number
};

// Pre-save middleware to generate a unique account number
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.accountNumber) {
    let newAccountNumber;
    let existingAccount;

    do {
      newAccountNumber = generateAccountNumber();
      existingAccount = await mongoose
        .model('User')
        .findOne({ accountNumber: newAccountNumber });
    } while (existingAccount); // Ensure uniqueness

    this.accountNumber = newAccountNumber;
  }
  next();
});

// Attach the pre-save middleware to the schema
userSchema.pre('save', async function (next) {
  try {
    // Check if the document being saved is new or already exists
    if (this.isNew) {
      // Generate a new referral code only for new documents
      let unique = false;
      let newReferralCode;

      // Loop until a unique referral code is generated
      while (!unique) {
        // Generate a new random referral code
        newReferralCode = generateRandomString(6);

        // Check if the generated code already exists in the database
        const existingUser = await User.findOne({
          myReferralCode: newReferralCode,
        });

        // If no user is found with the generated referral code, it is unique
        if (!existingUser) {
          unique = true;
        }
      }

      // Set the generated unique referral code to the document's myReferralCode field
      this.myReferralCode = newReferralCode;
    }

    // Proceed to save the document
    next();
  } catch (error) {
    // Handle any errors
    next(error);
  }
});

// setting a query middleware for it to find only users that their active status is not equal to false
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
