const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const Email = require('./../utilities/email');
const validator = require('validator');

// jwt token generator
const signAccessToken = (id) => {
  return jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

// jwt token generator
const signRefreshToken = (id) => {
  return jwt.sign({ id: id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  const {
    firstName,
    lastName,
    middleName,
    email,
    username,
    country,
    phoneNumber,
    transactionPin,
    accountType,
    password,
    passwordConfirm,
  } = req.body;

  const requiredFields = [
    'firstName',
    'lastName',
    'middleName',
    'email',
    'username',
    'country',
    'phoneNumber',
    'transactionPin',
    'accountType',
    'password',
    'passwordConfirm',
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({
        status: 'fail',
        message: `${field} is required`,
      });
    }
  }

  if (
    transactionPin.length < 4 ||
    transactionPin.length > 4 ||
    isNaN(transactionPin)
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid Transaction Pin, Enter a valid 4 digit pin',
    });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password does not match',
    });
  }

  try {
    // check if user with the given email and unconfirmed status exits
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Check if the existing user is unconfirmed, then delete
      if (existingUser.confirmed === false) {
        return res.status(400).json({
          status: 'fail',
          message: 'Go to your email and click the confirmation link',
        });
      } else {
        return res.status(400).json({
          status: 'fail',
          message: 'User with this email already exists',
        });
      }
    }

    //  create a new user
    const newUser = await User.create({
      firstName,
      lastName,
      middleName,
      email,
      username,
      country,
      phoneNumber,
      transactionPin,
      accountType,
      password,
      passwordConfirm,
      confirmed: true,
    });

    const user = await User.findOne({ email });

    // Send welcome email
    const url = `${req.protocol}://${req.get('host')}/user-dashboard`;
    await new Email(user, url).sendWelcome();

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.confirmEmailBE = async (req, res) => {
  try {
    const { token } = req.params;

    // Find the user by the confirmation token
    const user = await User.findOne({ confirmationToken: token });

    // check if the token exists
    if (!user || user.confirmationTokenExpires < Date.now()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired confirmation token.',
      });
    }

    // else Update the user's status to confirmed
    user.confirmed = true;
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;
    await user.save();

    // Send welcome email
    const url = `${req.protocol}://${req.get('host')}/user-dashboard`;
    await new Email(user, url).sendWelcome();

    // Redirect or respond with a success message
    res.status(200).json({
      status: 'success',
      message: 'Email confirmed successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.confirmEmailFE = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find the user by the confirmation token
    const user = await User.findOne({ confirmationToken: token });

    // check if the token exists
    if (!user || user.confirmationTokenExpires < Date.now()) {
      return res.status(500).render('error', {
        title: 'Error',
        user,
        message: 'Invalid or expired verification link! try signing up again',
      });
    }

    // else Update the user's status to confirmed
    user.confirmed = true;
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;
    await user.save();

    // Send welcome email
    const url = `${req.protocol}://${req.get('host')}/user-dashboard`;
    await new Email(user, url).sendWelcome();
    next();
  } catch (err) {
    return res.status(500).render('error', {
      title: 'Error',
      message: 'Something went wrong',
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { userId } = req.params;

  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      status: 'fail',
      message: 'Enter a valid OTP',
    });
  }

  try {
    const user = await User.findOne({ _id: userId, otp });

    if (!user || otp !== user.otp) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid OTP! try login again',
      });
    }

    const otpExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (Date.now() - user.otpCreatedAt > otpExpirationTime) {
      return res.status(400).json({
        status: 'fail',
        message: 'OTP has expired, try login again',
      });
    }

    // generating token for login
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Set cookies
    const accessCookieOptions = {
      expiresIn: new Date(Date.now() + process.env.ACCESS_TOKEN_EXPIRES_IN),
      secure: true,
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, //15 mins
    };

    const refreshCookieOptions = {
      expiresIn: new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRES_IN),
      secure: true,
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, //1 day
    };

    res.cookie('access-token', accessToken, accessCookieOptions);
    res.cookie('refresh-token', refreshToken, refreshCookieOptions);

    // update user refresh token
    await User.findOneAndUpdate(
      { email: user.email },
      { refreshToken, otp: '' },
      { new: true } // Returns the updated document
    );
    // sending response
    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: 'SOmething went wrong, try again!',
    });
  }
};

exports.login = async (req, res) => {
  try {
    // get the details entered

    const { email, password } = req.body;

    const sanitizedEmail = email ? validator.escape(email) : undefined;
    // const sanitizedPassword = password ? validator.escape(password) : undefined;

    // check if they entered anything
    if (!sanitizedEmail || !password) {
      res.status(401).json({
        status: 'fail',
        message: 'Please provide email and password!',
      });
      return;
    }

    // fetching data from database
    const user = await User.findOne({
      $or: [{ email: sanitizedEmail }, { username: sanitizedEmail }],
    }).select('+password');

    // comparing the input data and the saved data
    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'incorrect password or email',
      });
      return;
    }

    // comparing the input data and the saved data
    if (user.status === false) {
      return res.status(401).json({
        status: 'fail',
        message:
          'Your account have been temporarily suspended, contact support',
      });
    }

    if (user.role !== 'user') {
      return res.status(401).json({
        status: 'fail',
        message: 'This user is an admin',
      });
    }

    if (user.confirmed === false) {
      return res.status(403).json({
        status: 'fail',
        message:
          'Go to your mail and click the confirmation link to confirm your email before login',
      });
    }

    // comparing the input data and the saved data
    if (!(await user.correctPassword(password, user.password))) {
      res.status(401).json({
        status: 'fail',
        message: 'incorrect password or email',
      });
      return;
    }

    // Request for OTP
    // Send welcome email
    function generateOTP(length = 6) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // A-Z and 0-9
      let otp = '';
      for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return otp;
    }

    // Example usage
    const url = generateOTP(6); // Generates a 6-character OTP
    await new Email(user, url).sendOtp();

    user.otp = url;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent',
      data: {
        user: user.id,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Something went wrong, try again later!',
    });
  }
  try {
    const user = await User.findById(userId);

    // Request for OTP
    // Send welcome email
    function generateOTP(length = 6) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // A-Z and 0-9
      let otp = '';
      for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return otp;
    }

    // Example usage
    const url = generateOTP(6); // Generates a 6-character OTP
    await new Email(user, url).sendOtp();

    user.otp = url;

    await user.save();

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User Not Found!',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent',
      data: {
        user: user.id,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    // get the details entered

    const { email, password } = req.body;

    const sanitizedEmail = email ? validator.escape(email) : undefined;
    // const sanitizedPassword = password ? validator.escape(password) : undefined;

    // check if they entered anything
    if (!sanitizedEmail || !password) {
      res.status(401).json({
        status: 'fail',
        message: 'Please provide email and password!',
      });
      return;
    }

    // fetching data from database
    const user = await User.findOne({ email: sanitizedEmail }).select(
      '+password'
    );

    // comparing the input data and the saved data
    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'incorrect password or email',
      });
      return;
    }

    if (user.role !== 'admin') {
      return res.status(401).json({
        status: 'fail',
        message: 'This user is not an admin',
      });
    }

    if (user.confirmed === false) {
      return res.status(403).json({
        status: 'fail',
        message:
          'Go to your mail and click the confirmation link to confirm your email before login',
      });
    }

    // comparing the input data and the saved data
    if (!(await user.correctPassword(password, user.password))) {
      res.status(401).json({
        status: 'fail',
        message: 'incorrect password or email',
      });
      return;
    }

    // generating token for login
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Set cookies
    const accessCookieOptions = {
      expiresIn: new Date(Date.now() + process.env.ACCESS_TOKEN_EXPIRES_IN),
      secure: true,
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, //15 mins
    };

    const refreshCookieOptions = {
      expiresIn: new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRES_IN),
      secure: true,
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, //1 day
    };

    res.cookie('access-token', accessToken, accessCookieOptions);
    res.cookie('refresh-token', refreshToken, refreshCookieOptions);
    // update user refresh token
    await User.findOneAndUpdate({ email: user.email }, { refreshToken });
    // sending response
    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  let refreshToken;
  try {
    // step 1: get the jwt token and check if its true
    // if (
    //   req.headers.authorization &&
    //   req.headers.authorization.startsWith('Bearer')
    // ) {
    //   token = req.headers.authorization.split(' ')[1];
    const accessToken = req.cookies['access-token'];
    refreshToken = req.cookies['refresh-token'];

    //  check if refresh token exists
    if (!refreshToken) {
      return res.status(403).json({
        status: 'fail',
        message: 'Login to access this service',
      });
    }

    // step 2: verification of token
    const decodedAccessToken = await promisify(jwt.verify)(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const decodedRefreshToken = await promisify(jwt.verify)(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // compare the cookie refresh token and the one from database
    const DBrefreshToken = await User.find(
      { _id: decodedRefreshToken.id },
      { refreshToken: 1 }
    );
    let token = DBrefreshToken[0].refreshToken;
    token = token.toString();
    if (token !== refreshToken) {
      // return res.status(400).json({
      //   status: 'fail',
      //   message: 'Unauthorized - invalid token',
      // });
      return res.status(302).redirect('/sign-in');
    }
    // step 3: check if user still exists
    const currentUser = await User.findById(decodedAccessToken.id);

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'the user belonging to this token does no longer exists',
      });
    }

    // step 4: check if the user changed password after the token was issued
    // if (currentUser.changedPasswordAfter(decodedRefreshToken.iat)) {
    //   return res.status(401).json({
    //     status: 'fail',
    //     message: 'user recently changed password! please login again',
    //   });
    // }

    // step 5: grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    if (
      err.name === 'TokenExpiredError' ||
      (err.name === 'JsonWebTokenError' && refreshToken)
    ) {
      // Access token expired or invalid
      try {
        if (!refreshToken) {
          throw new Error('Unauthorized - Refresh token missing');
        }
        // Verify the refresh token
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        // Check if refresh token is still valid
        // If refresh token is valid, generate a new access token
        // and continue to next middleware
        // If refresh token is not valid, throw an error
        // Here, you would typically check if the refresh token is stored in a database
        // and compare it with the stored refresh tokens for the user
        // For simplicity, I'm assuming the refresh token is a JWT and directly checking its validity

        // Retrieve the current user
        const currentUser = await User.findById(decodedRefreshToken.id);
        if (!currentUser) {
          throw new Error('Unauthorized - Go to sign in');
        }

        const newAccessToken = jwt.sign(
          { id: decodedRefreshToken.id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: '15m',
          }
        );

        const cookieOptions = {
          httpOnly: true,
          secure: true,
          path: '/',
          sameSite: 'none',
          maxAge: 15 * 60 * 1000, //15 mins
        };

        res.cookie('access-token', newAccessToken, cookieOptions); // Set new access token in cookie
        req.user = currentUser; // Set user in request object
        res.locals.user = currentUser; // Set user in response locals
        next(); // Continue to next middleware
      } catch (refreshTokenError) {
        return res.status(401).json({
          status: 'fail',
          message: refreshTokenError.message,
        });
      }
    } else {
      // Access token not provided
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized - Access token must be provided',
      });
    }
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(404).render('error', {
        title: 'Error',
      });
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // step 1: get user based on posted email
  try {
    const email = req.body.email;

    const sanitizedEmail = email ? validator.escape(email) : undefined;
    const user = await User.findOne({ email: sanitizedEmail });

    // step 2: check if the user exists
    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'There is no user with email address',
      });
      return;
    }

    // step 3: generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // step 5: sending the email
    try {
      const resetUrl = `${req.protocol}://${req.get(
        'host'
      )}/reset-password/${resetToken}`;

      await new Email(user, resetUrl).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      (user.passwordResetToken = undefined),
        (user.passwordResetExpires = undefined),
        await user.save({ validateBeforeSave: false });

      return next(
        res.status(500).json({
          status: 'fail',
          message: 'there was an error sending the email, try again',
        })
      );
    }
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  // step 1: get user based on the token
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // step 2: if the token has not expired and there is user set the new password
    if (!user) {
      res
        .status(400)
        .json({ status: 'fail', message: 'Token is invalid or has expired' });
      return;
    }

    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    const sanitizedPassword = password ? validator.escape(password) : undefined;
    const sanitizedPasswordConfirm = passwordConfirm
      ? validator.escape(passwordConfirm)
      : undefined;

    user.password = sanitizedPassword;
    user.passwordConfirm = sanitizedPasswordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // step 3: generate JWT and login the user
    // const accessToken = signAccessToken(user._id);
    // const refreshToken = signRefreshToken(user._id);

    // Set cookies
    // const accessCookieOptions = {
    //   expiresIn: new Date(Date.now() + process.env.ACCESS_TOKEN_EXPIRES_IN),
    //   secure: true,
    //   httpOnly: true,
    //   path: '/',
    //   sameSite: 'none',
    //   maxAge: 15 * 60 * 1000, //15 mins
    // };

    // const refreshCookieOptions = {
    //   expiresIn: new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRES_IN),
    //   secure: true,
    //   httpOnly: true,
    //   path: '/',
    //   sameSite: 'none',
    //   maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    // };

    // res.cookie('access-token', accessToken, accessCookieOptions);
    // res.cookie('refresh-token', refreshToken, refreshCookieOptions);
    // sending response
    res.status(200).json({
      status: 'success',
      // accessToken,
      // refreshToken,
    });
    next();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    const passwordCurrent = req.body.passwordCurrent;
    // const sanitizedPasswordCurrent = passwordCurrent
    //   ? validator.escape(passwordCurrent)
    //   : undefined;

    // The rest of your code for password validation...

    // comparing the input data and the saved data
    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      res.status(401).json({
        status: 'fail',
        message: 'your current password is wrong.',
      });
      return;
    }

    // Check if the request body contains password and passwordConfirm
    if (!req.body.password || !req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password and password confirmation are required',
      });
    }

    if (req.body.password !== req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords does not match',
      });
    }

    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    // const sanitizedPassword = validator.escape(password);
    // const sanitizedPasswordConfirm = validator.escape(passwordConfirm);

    // Update user password and passwordConfirm
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // Generate a new JWT token
    // const accessToken = signAccessToken(user._id);
    // const refreshToken = signRefreshToken(user._id);

    // Set cookies
    // const accessCookieOptions = {
    //   expiresIn: new Date(Date.now() + process.env.ACCESS_TOKEN_EXPIRES_IN),
    //   secure: true,
    //   httpOnly: true,
    //   path: '/',
    //   sameSite: 'none',
    //   maxAge: 15 * 60 * 1000, //15 mins
    // };

    // const refreshCookieOptions = {
    //   expiresIn: new Date(Date.now() + process.env.REFRESH_TOKEN_EXPIRES_IN),
    //   secure: true,
    //   httpOnly: true,
    //   path: '/',
    //   sameSite: 'none',
    //   maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    // };

    // res.cookie('access-token', accessToken, accessCookieOptions);
    // res.cookie('refresh-token', refreshToken, refreshCookieOptions);
    // sending response
    res.status(200).json({
      status: 'success',
      // accessToken,
      // refreshToken,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Find the user document by its ID
    await User.findByIdAndUpdate({ _id: req.user.id }, { refreshToken: '' });

    // Clear the access token cookie
    res.clearCookie('access-token', {
      httpOnly: true,
      sameSite: 'strict', // Adjust as needed
      secure: true, // Adjust as needed based on your deployment environment
    });

    // Clear the refresh token cookie
    res.clearCookie('refresh-token', {
      httpOnly: true,
      sameSite: 'strict', // Adjust as needed
      secure: true, // Adjust as needed based on your deployment environment
    });

    res.status(200).json({
      status: 'success',
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Function to update user data
exports.updateUserData = async (req, res) => {
  // Handle optional payment proof
  const paymentProof =
    req.files && req.files.paymentProof ? req.files.paymentProof[0].path : null; // Cloudinary URL or null
  try {
    // Step 1: Authentication - Verify JWT token
    const decoded = await promisify(jwt.verify)(
      req.cookies['access-token'], // Assuming the JWT is stored in a cookie
      process.env.ACCESS_TOKEN_SECRET
    );

    // Step 2: Fetch the user from the database
    const currentUser = await User.findById(decoded.id);

    const {
      firstName,
      lastName,
      username,
      phoneNumber,
      country,
      zip,
      city,
      dateOfBirth,
      address,
      gender,
      transactionPin,
    } = req.body;

    // Step 3: Update user data based on the request body

    if (transactionPin && !/^\d{4}$/.test(transactionPin)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Transaction Pin, Enter a valid 4 digit pin',
      });
    }

    if (country) {
      currentUser.country = country;
    }

    if (zip) {
      currentUser.zip = zip;
    }

    if (city) {
      currentUser.city = city;
    }

    if (dateOfBirth) {
      currentUser.dateOfBirth = dateOfBirth;
    }

    if (address) {
      currentUser.address = address;
    }

    if (gender) {
      currentUser.gender = gender;
    }

    if (req.body.firstName) {
      currentUser.firstName = firstName;
    }

    if (req.body.lastName) {
      currentUser.lastName = lastName;
    }

    if (req.body.username) {
      currentUser.username = username;
    }

    if (req.body.phoneNumber) {
      currentUser.phoneNumber = phoneNumber;
    }

    if (paymentProof) {
      currentUser.paymentProof = paymentProof;
    }

    if (transactionPin) {
      currentUser.transactionPin = transactionPin;
    }

    // Step 4: Save the updated user data
    await currentUser.save();

    // Step 5: Respond with success message and updated user data
    res.status(200).json({
      status: 'success',
      data: {
        user: currentUser,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (!req.cookies['refresh-token']) {
      return next();
    }

    if (req.cookies['access-token']) {
      // step 2: verification of token
      const decoded = await promisify(jwt.verify)(
        req.cookies['access-token'],
        process.env.ACCESS_TOKEN_SECRET
      );

      const decodedRefreshToken = await promisify(jwt.verify)(
        req.cookies['refresh-token'],
        process.env.REFRESH_TOKEN_SECRET
      );

      // step 3: check if user still exists
      const currentUser = await User.findById(decoded.id);
      const refresh = await User.findById(decodedRefreshToken.id);

      if (!currentUser || !refresh) {
        return next();
      }

      const refreshTokenFromDb = await User.findOne({
        refreshToken: req.cookies['refresh-token'],
      });

      if (!refreshTokenFromDb) {
        return next();
      }

      // step 4: check if the user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // step 5: grant access to protected route
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } else {
      if (req.cookies['refresh-token']) {
        const decodedRefreshToken = await promisify(jwt.verify)(
          req.cookies['refresh-token'],
          process.env.REFRESH_TOKEN_SECRET
        );

        const currentUser = await User.findById(decodedRefreshToken.id);
        if (!currentUser) {
          return next();
        }

        const newAccessToken = jwt.sign(
          {
            id: decodedRefreshToken.id,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: '15m',
          }
        );

        const cookieOptions = {
          httpOnly: true,
          secure: true,
          path: '/',
          sameSite: 'none',
          maxAge: 15 * 60 * 1000,
        };

        res.cookie('access-token', newAccessToken, cookieOptions);

        req.user = currentUser;
        res.locals.user = currentUser;
        return next();
      }
    }
    next();
  } catch (err) {
    return next();
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const users = await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.adminEditUserData = async (req, res) => {
  const { userId } = req.params;

  const {
    firstName,
    lastName,
    email,
    role,
    username,
    country,
    gender,
    phoneNumber,
    city,
    zip,
    address,
    depositStatus,
    withdrawalStatus,
    sendMoneyStatus,
    kycStatus,
  } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    if (email) {
      user.email = email;
    }

    if (role) {
      user.role = role;
    }

    if (username) {
      user.username = username;
    }

    if (country) {
      user.country = country;
    }

    if (gender) {
      user.gender = gender;
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    if (zip) {
      user.zip = zip;
    }
    if (city) {
      user.city = city;
    }
    if (address) {
      user.address = address;
    }
    if (depositStatus) {
      user.depositStatus = depositStatus;
    }
    if (withdrawalStatus) {
      user.withdrawalStatus = withdrawalStatus;
    }
    if (sendMoneyStatus) {
      user.sendMoneyStatus = sendMoneyStatus;
    }

    if (kycStatus) {
      user.kycStatus = kycStatus;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      status: 'success',
      data: {
        updatedUser,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deactivateUserAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    if (user.status === false) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot perform this action, account is already inactive!',
      });
    }

    user.status = false;
    user.refreshToken = '';

    await user.save();

    const loginUrl = `${req.protocol}://${req.get('host')}/sign-in`;

    await new Email(user, loginUrl).accountDeactivationEmail();

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.activateUserAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    if (user.status === true) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot perform this action, account is already active!',
      });
    }

    user.status = true;

    await user.save();

    const loginUrl = `${req.protocol}://${req.get('host')}/sign-in`;

    await new Email(user, loginUrl).accountActivationEmail();

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.activateUserTransfer = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    if (user.transferStatus === true) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot perform this action, transfer is already active!',
      });
    }

    user.transferStatus = true;

    await user.save();

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deActivateUserTransfer = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    if (user.transferStatus === false) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot perform this action, transfer is already active!',
      });
    }

    user.transferStatus = false;

    await user.save();

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
