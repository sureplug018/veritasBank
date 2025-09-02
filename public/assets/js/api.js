////////////////////////////////////////
// alerts

// Using iziToast for alerts
function showAlert(type, msg) {
  // Map custom alert types to iziToast methods
  const iziToastTypes = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  const status = iziToastTypes[type] || 'info';

  // Show the iziToast notification
  iziToast[status]({
    message: msg,
    position: 'topRight',
    timeout: 5000, // Display for 5 seconds
  });
}

const showAlert2 = (type, msg, redirectUrl) => {
  Swal.fire({
    icon: type,
    text: msg,
    draggable: true,
  }).then(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl; // Redirect to the specified URL
    }
  });
};

function formatCurrency(amount) {
  return Number(amount).toLocaleString();
}

const signUp = async (formData) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Signed up successfully!');
      window.setTimeout(() => {
        location.assign('/sign-in');
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      const userId = res.data.data.user;
      showAlert('success', 'OTP sent to your email!');
      window.setTimeout(() => {
        location.assign(`/verify-otp/${userId}`);
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const adminSignIn = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login/admin',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Login Successful!');
      window.setTimeout(() => {
        location.assign('/admin/dashboard');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const verifyOtp = async (otp, userId) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/verify-otp/${userId}`,
      data: {
        otp,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Login Successful!');
      window.setTimeout(() => {
        location.assign('/dashboard');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password reset email sent!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const resetPassword = async (password, passwordConfirm, resetToken) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${resetToken}`,
      data: {
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Successfully reset password');

      // Redirect to the login page after a delay
      window.setTimeout(() => {
        location.assign('/sign-in');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const deposit = async (
  amount,
  gateway,
  wallet,
  address,
  cvv,
  cardName,
  cardNumber,
  expiryDate,
  transactionPin
) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/transactions/deposit',
      data: {
        amount,
        gateway,
        wallet,
        address,
        cvv,
        cardName,
        cardNumber,
        expiryDate,
        transactionPin,
      },
    });

    if (res.data.status === 'success') {
      showAlert2(
        'warning',
        'Transaction is processing!',
        '/history/transactions'
      );

      // window.setTimeout(() => {
      //   location.reload();
      // }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert2('error', err.response.data.message);
  }
};

const transfer = async (
  gateway,
  amount,
  receiverName,
  accountNumber,
  IBAN,
  swiftCode,
  bankName,
  wallet,
  address,
  BIC,
  sortCode,
  description,
  routingNumber,
  accountType,
  transactionPin
) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/transactions/transfer',
      data: {
        gateway,
        amount,
        receiverName,
        accountNumber,
        IBAN,
        swiftCode,
        bankName,
        wallet,
        address,
        BIC,
        sortCode,
        description,
        routingNumber,
        accountType,
        transactionPin,
      },
    });

    if (res.data.status === 'success') {
      const transaction = res.data.data.transaction;
      if (transaction.gateway === 'Inter-Bank Transfer') {
        showAlert2(
          'success',
          `You've sent $${formatCurrency(transaction.amount)} to ${
            transaction.receiverName
          } successfully!`,
          '/history/transactions'
        );
      } else if (transaction.gateway === 'Crypto') {
        showAlert2(
          'success',
          `Your transfer of $${formatCurrency(transaction.amount)} worth of ${
            transaction.wallet
          } to ${
            transaction.address
          } is currently under review and awaiting approval. Thank you for your request!`,
          '/history/transactions'
        );
      } else if (
        transaction.gateway !== 'Intra-Bank Transfer' &&
        transaction.status === 'pending'
      ) {
        showAlert2(
          'warning',
          `Your transfer of $${formatCurrency(transaction.amount)} to ${
            transaction.receiverName
          } is currently under review and awaiting approval. Thank you for your request!`,
          '/history/transactions'
        );
      } else if (
        transaction.gateway !== 'Intra-Bank Transfer' &&
        transaction.status === 'confirmed'
      ) {
        showAlert2(
          'success',
          `You've sent $${formatCurrency(transaction.amount)} to ${
            transaction.receiverName
          } successfully!`,
          '/history/transactions'
        );
      }
      // window.setTimeout(() => {
      //   location.reload();
      // }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert2('error', err.response.data.message);
  }
};

const applyForLoan = async (amount, duration, description, transactionPin) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/loans/apply-for-loan',
      data: {
        amount,
        duration,
        description,
        transactionPin,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Loan Application Successful!');

      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const applyForCard = async (
  cardType,
  name,
  email,
  phoneNumber,
  address,
  zipCode,
  country,
  amount,
  wallet,
  transactionPin
) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/card-applications/create-card-application',
      data: {
        cardType,
        name,
        email,
        phoneNumber,
        address,
        zipCode,
        country,
        amount,
        wallet,
        transactionPin,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Card Application Successful!');

      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const support = async (fullName, subject, message) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/supports/send-support',
      data: {
        fullName,
        subject,
        message,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Message Sent!');

      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const updateUserData = async (formData) => {
  try {
    const res = await axios({
      method: 'patch',
      url: '/api/v1/users/update',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Profile Updated Successfully!');
      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const updatePassword = async (passwordCurrent, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'patch',
      url: '/api/v1/users/updateMyPassword',
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password updated successfully!');

      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const addWallet = async (name, address) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/wallets/create-wallet',
      data: {
        name,
        address,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Wallet added Successfully!');
      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const kyc = async (formData) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/kyc/upload-kyc',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Success! Wait for verification.');
      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const payBill = async (type, specification, amount, transactionPin) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/bills/pay-bill',
      data: {
        type,
        specification,
        amount,
        transactionPin,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Bill Payment Successful!');
      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const sendMailToAllUsers = async (subject, message) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/supports/send-mail-to-all-users',
      data: {
        subject,
        message,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Newsletter Sent Successful!');
      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

const zelle = async (email, amount, transactionPin) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/transactions/zelle',
      data: {
        email,
        amount,
        transactionPin,
      },
    });

    if (res.data.status === 'success') {
      const transaction = res.data.data.transaction;
      if (transaction.status === 'confirmed') {
        showAlert2(
          'success',
          `You've sent $${formatCurrency(transaction.amount)} to ${
            transaction.receiverName
          } successfully!`,
          '/history/transactions'
        );
      } else if (transaction.status === 'pending') {
        showAlert2(
          'warning',
          `Your transfer of $${formatCurrency(transaction.amount)} to ${
            transaction.receiverName
          } is currently under review and awaiting approval. Thank you for your request!`,
          '/history/transactions'
        );
      }
      // window.setTimeout(() => {
      //   location.reload();
      // }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert2('error', err.response.data.message);
  }
};

const logoutUser = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      setTimeout(function () {
        location.href = '/';
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
const signupForm = document.querySelector('.form-signup');
const loginForm = document.querySelector('.form-login');
const verifyOtpForm = document.querySelector('.otp-form');
const forgotPasswordButton = document.querySelector('.form-forgot-password');
const resetPasswordButton = document.querySelector('.form-reset-password');
const depositForm = document.querySelector('.deposit-form');
const transferForm = document.querySelector('.transfer-form');
const loanForm = document.querySelector('.loan-form');
const cardApplicationForm = document.querySelector('.card-application-form');
const supportForm = document.querySelector('.support-form');
const userForm = document.querySelector('.user-form');
const updatePasswordForm = document.querySelector('.password-form');
const kycForm = document.querySelector('.kyc-form');
const billForm = document.querySelector('.bill-form');
const adminSignInForm = document.querySelector('.admin-form-login');
const allUserMailForm = document.querySelector('.all-user-mail-form');
const zelleForm = document.querySelector('.zelle-form');
const logoutUserBtn = document.querySelectorAll('.signOut-user-btn');
const addWalletForm = document.querySelector('.add-wallet-form');

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

if (logoutUserBtn) {
  logoutUserBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      await logoutUser();
    });
  });
}

if (addWalletForm) {
  addWalletForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.querySelector('.add-wallet-btn');

    submitBtn.textContent = 'Processing...';
    submitBtn.ariaDisabled = true;
    submitBtn.style.opacity = '0.5';

    const name = document.getElementById('wallet').value;
    const address = document.getElementById('address').value;

    await addWallet(name, address);

    submitBtn.textContent = 'Invest Now';
    submitBtn.ariaDisabled = false;
    submitBtn.style.opacity = '1';
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--signup').style.opacity = '0.5';
    document.querySelector('.btn--signup').textContent = 'signing up...';
    document.querySelector('.btn--signup').disabled = true;

    const formData = new FormData();

    formData.append('firstName', document.getElementById('firstName').value);
    formData.append('lastName', document.getElementById('lastName').value);
    formData.append('middleName', document.getElementById('middleName').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('username', document.getElementById('username').value);
    formData.append('country', document.getElementById('country').value);
    formData.append(
      'phoneNumber',
      document.getElementById('phoneNumber').value
    );
    formData.append(
      'transactionPin',
      document.getElementById('transactionPin').value
    );
    formData.append('address', document.getElementById('address').value);
    formData.append('city', document.getElementById('city').value);
    formData.append('state', document.getElementById('state').value);
    formData.append('zipcode', document.getElementById('zipcode').value);
    formData.append('gender', document.getElementById('gender').value);
    formData.append(
      'dateOfBirth',
      document.getElementById('dateOfBirth').value
    );
    formData.append('paymentProof', document.getElementById('photo').value);
    formData.append(
      'accountType',
      document.getElementById('accountType').value
    );
    formData.append('password', document.getElementById('password').value);
    formData.append(
      'passwordConfirm',
      document.getElementById('passwordConfirm').value
    );
    formData.append('paymentProof', document.getElementById('photo').files[0]);

    await signUp(formData);
    document.querySelector('.btn--signup').style.opacity = '1';
    document.querySelector('.btn--signup').disabled = false;
    document.querySelector('.btn--signup').textContent = 'sign up';
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.login-btn').style.opacity = '0.5';
    document.querySelector('.login-btn').textContent = 'Signing in...';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);
    document.querySelector('.login-btn').style.opacity = '1';
    document.querySelector('.login-btn').textContent = 'Sign in';
  });
}

if (adminSignInForm) {
  adminSignInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.login-btn').style.opacity = '0.5';
    document.querySelector('.login-btn').textContent = 'Signing in...';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await adminSignIn(email, password);
    document.querySelector('.login-btn').style.opacity = '1';
    document.querySelector('.login-btn').textContent = 'Sign in';
  });
}

if (verifyOtpForm) {
  const otpInput = document.getElementById('otp');
  const otpButton = document.querySelector('.otp-btn');

  otpInput.addEventListener('input', async () => {
    if (otpInput.value.length === 6) {
      otpButton.style.opacity = '0.5';
      otpButton.textContent = 'Verifying...';

      // Get the resetToken from the URL parameters
      const urlParams = window.location.pathname.split('/').pop();
      await verifyOtp(otpInput.value, urlParams);

      otpButton.style.opacity = '1';
      otpButton.textContent = 'Resend OTP';
    }
  });
}

if (forgotPasswordButton) {
  forgotPasswordButton.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--forgot').style.opacity = '0.5';
    document.querySelector('.btn--forgot').textContent =
      'Sending reset link...';

    const email = document.getElementById('email').value;

    await forgotPassword(email);

    document.querySelector('.btn--forgot').style.opacity = '1';
    document.querySelector('.btn--forgot').textContent =
      'Send password reset email';
  });
}

if (resetPasswordButton) {
  resetPasswordButton.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--reset').style.opacity = '0.5';
    document.querySelector('.btn--reset').textContent = 'Resetting password...';

    // Get the resetToken from the URL parameters
    const urlParams = window.location.pathname.split('/').pop();

    // Get the password and passwordConfirm from the form fields
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    // Call the resetPassword function with the obtained resetToken
    await resetPassword(password, passwordConfirm, urlParams);

    document.querySelector('.btn--reset').style.opacity = '1';
    document.querySelector('.btn--reset').textContent = 'Reset password';
  });
}

if (depositForm) {
  depositForm.addEventListener('click', function (e) {
    e.preventDefault();
    const depositModal = document.querySelector('.depositModal');
    depositModal.setAttribute('aria-hidden', 'false');
  });
}

if (transferForm) {
  transferForm.addEventListener('click', function (e) {
    e.preventDefault();
    const transferModal = document.querySelector('.transferModal');
    transferModal.setAttribute('aria-hidden', 'false');
  });
}

if (zelleForm) {
  zelleForm.addEventListener('click', function (e) {
    e.preventDefault();
    const zelleModal = document.querySelector('.zelleModal');
    zelleModal.setAttribute('aria-hidden', 'false');
  });
}

if (loanForm) {
  loanForm.addEventListener('click', function (e) {
    e.preventDefault();
    const loanModal = document.querySelector('.loanModal');
    loanModal.setAttribute('aria-hidden', 'false');
  });
}

if (cardApplicationForm) {
  cardApplicationForm.addEventListener('click', function (e) {
    e.preventDefault();
    const cardApplicationModal = document.querySelector(
      '.cardApplicationModal'
    );
    cardApplicationModal.setAttribute('aria-hidden', 'false');
  });
}

if (billForm) {
  billForm.addEventListener('click', function (e) {
    e.preventDefault();
    const billModal = document.querySelector('.billModal');
    billModal.setAttribute('aria-hidden', 'false');
  });
}

// Selecting the deposit button outside the modal trigger
const depositBtn = document.querySelector('.deposit-btn');
if (depositBtn) {
  depositBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevents form submission if it's inside a form

    depositBtn.style.opacity = '0.5';
    depositBtn.textContent = 'Processing...';
    depositBtn.ariaDisabled = true;

    // Collecting data from the inputs
    const amount = document.getElementById('amount')?.value;
    const gateway = document.getElementById('gateway')?.value;
    const wallet = document.getElementById('wallet')?.value;
    const address = document.getElementById('address')?.value || null;
    const cvv = document.getElementById('cvv')?.value || null;
    const cardName = document.getElementById('cardName')?.value || null;
    const cardNumber = document.getElementById('cardNumber')?.value || null;
    const expiryDate = document.getElementById('expiryDate')?.value || null;
    const transactionPin =
      document.getElementById('transactionPin')?.value || null;

    await deposit(
      amount,
      gateway,
      wallet,
      address,
      cvv,
      cardName,
      cardNumber,
      expiryDate,
      transactionPin
    );

    depositBtn.style.opacity = '1';
    depositBtn.textContent = 'Deposit';
    depositBtn.ariaDisabled = false;
  });
}

// Selecting the deposit button outside the modal trigger
const zelleBtn = document.querySelector('.zelle-btn');
if (zelleBtn) {
  zelleBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevents form submission if it's inside a form

    zelleBtn.style.opacity = '0.5';
    zelleBtn.textContent = 'Processing...';
    zelleBtn.ariaDisabled = true;

    // Collecting data from the inputs
    const email = document.getElementById('email').value;
    const amount = document.getElementById('amount').value;
    const transactionPin = document.getElementById('transactionPin').value;

    await zelle(email, amount, transactionPin);

    zelleBtn.style.opacity = '1';
    zelleBtn.textContent = 'Transfer';
    zelleBtn.ariaDisabled = false;
  });
}

const transferBtn = document.querySelector('.transfer-btn');
if (transferBtn) {
  transferBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    transferBtn.style.opacity = '0.5';
    transferBtn.textContent = 'Processing...';
    transferBtn.ariaDisabled = true;

    const gateway = document.getElementById('gateway')?.value || null;
    const amount = document.getElementById('amount')?.value || null;
    const receiverName = document.getElementById('receiverName')?.value || null;
    const accountNumber =
      document.getElementById('accountNumber')?.value || null;
    const IBAN = document.getElementById('IBAN')?.value || null;
    const swiftCode = document.getElementById('swiftCode')?.value || null;
    const bankName = document.getElementById('bankName')?.value || null;
    const address = document.getElementById('address')?.value || null;
    const BIC = document.getElementById('BIC')?.value || null;
    const wallet = document.getElementById('wallet')?.value || null;
    const sortCode = document.getElementById('sortCode')?.value || null;
    const description = document.getElementById('description')?.value || null;
    const routingNumber =
      document.getElementById('routingNumber')?.value || null;
    const accountType = document.getElementById('accountType')?.value || null;
    const transactionPin =
      document.getElementById('transactionPin')?.value || null;

    await transfer(
      gateway,
      amount,
      receiverName,
      accountNumber,
      IBAN,
      swiftCode,
      bankName,
      wallet,
      address,
      BIC,
      sortCode,
      description,
      routingNumber,
      accountType,
      transactionPin
    );

    transferBtn.style.opacity = '1';
    transferBtn.textContent = 'Transfer';
    transferBtn.ariaDisabled = false;
  });
}

const loanBtn = document.querySelector('.loan-btn');
if (loanBtn) {
  loanBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    loanBtn.style.opacity = '0.5';
    loanBtn.textContent = 'Processing...';
    loanBtn.ariaDisabled = true;

    const amount = document.getElementById('amount').value;
    const duration = document.getElementById('duration').value;
    const description = document.getElementById('description').value;
    const transactionPin = document.getElementById('transactionPin').value;

    await applyForLoan(amount, duration, description, transactionPin);

    loanBtn.style.opacity = '1';
    loanBtn.textContent = 'Apply';
    loanBtn.ariaDisabled = false;
  });
}

const cardApplicationButton = document.querySelector('.card-application-btn');
if (cardApplicationButton) {
  cardApplicationButton.addEventListener('click', async (e) => {
    e.preventDefault();

    cardApplicationButton.style.opacity = '0.5';
    cardApplicationButton.textContent = 'Processing...';
    cardApplicationButton.ariaDisabled = true;

    const cardType = document.getElementById('cardType').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const address = document.getElementById('address').value;
    const zipCode = document.getElementById('zipCode').value;
    const country = document.getElementById('country').value;
    const amount = document.getElementById('amount').value;
    const wallet = document.getElementById('wallet').value;
    const transactionPin = document.getElementById('transactionPin').value;

    await applyForCard(
      cardType,
      name,
      email,
      phoneNumber,
      address,
      zipCode,
      country,
      amount,
      wallet,
      transactionPin
    );

    cardApplicationButton.style.opacity = '1';
    cardApplicationButton.textContent = 'Apply';
    cardApplicationButton.ariaDisabled = false;
  });
}

if (supportForm) {
  supportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const supportBtn = document.querySelector('.support-btn');
    supportBtn.style.opacity = '0.5';
    supportBtn.textContent = 'Sending...';
    supportBtn.ariaDisabled = true;

    const fullName = document.getElementById('fullName').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    await support(fullName, subject, message);

    supportBtn.style.opacity = '1';
    supportBtn.textContent = 'Send Message';
    supportBtn.ariaDisabled = false;
  });
}

if (userForm) {
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');

    submitBtn.textContent = 'Processing...';
    submitBtn.ariaDisabled = true;
    submitBtn.style.opacity = '0.5';

    const formData = new FormData();

    formData.append('firstName', document.getElementById('firstName').value);
    formData.append('lastName', document.getElementById('lastName').value);
    formData.append(
      'dateOfBirth',
      document.getElementById('dateOfBirth').value
    );
    formData.append('middleName', document.getElementById('middleName').value);
    formData.append('address', document.getElementById('address').value);
    formData.append('username', document.getElementById('username').value);
    formData.append('gender', document.getElementById('gender').value);
    formData.append(
      'phoneNumber',
      document.getElementById('phoneNumber').value
    );
    formData.append('country', document.getElementById('country').value);
    formData.append(
      'paymentProof',
      document.getElementById('imageCover').files[0]
    );
    formData.append(
      'transactionPin',
      document.getElementById('transactionPin').value
    );

    await updateUserData(formData);

    submitBtn.textContent = 'Update';
    submitBtn.ariaDisabled = false;
    submitBtn.style.opacity = '1';
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = document.querySelector('.submit-btn1');
    button.style.opacity = '0.5';
    button.textContent = 'Saving...';
    const passwordCurrent = document.getElementById('passwordCurrent').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    await updatePassword(passwordCurrent, password, passwordConfirm);
    button.style.opacity = '1';
    button.textContent = 'Change Password';
  });
}

if (kycForm) {
  kycForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn2');

    submitBtn.textContent = 'Uploading...';
    submitBtn.ariaDisabled = true;
    submitBtn.style.opacity = '0.5';

    const formData = new FormData();

    formData.append('front', document.getElementById('front').files[0]);
    formData.append('back', document.getElementById('back').files[0]);

    await kyc(formData);

    submitBtn.textContent = 'Upload Kyc';
    submitBtn.ariaDisabled = false;
    submitBtn.style.opacity = '1';
  });
}

const billBtn = document.querySelector('.bill-btn');
if (billBtn) {
  billBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    billBtn.textContent = 'Processing...';
    billBtn.ariaDisabled = true;
    billBtn.style.opacity = '0.5';

    const type = document.getElementById('type').value;
    const specification = document.getElementById('specification').value;
    const amount = document.getElementById('amount').value;
    const transactionPin = document.getElementById('transactionPin').value;

    await payBill(type, specification, amount, transactionPin);

    billBtn.textContent = 'Pay Bill';
    billBtn.ariaDisabled = false;
    billBtn.style.opacity = '1';
  });
}

if (allUserMailForm) {
  allUserMailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const mailBtn = document.querySelector('.send-mail-btn');

    mailBtn.textContent = 'Processing...';
    mailBtn.ariaDisabled = true;
    mailBtn.style.opacity = '0.5';

    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    await sendMailToAllUsers(subject, message);

    mailBtn.textContent = 'Pay Bill';
    mailBtn.ariaDisabled = false;
    mailBtn.style.opacity = '1';
  });
}

const approveTransactionBtn = document.querySelectorAll(
  '.approve-transaction-btn'
);
const declineTransactionBtn = document.querySelectorAll(
  '.decline-transaction-btn'
);

if (approveTransactionBtn) {
  approveTransactionBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const transactionId = button.dataset.transactionId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(
          `/api/v1/transactions/approve-transaction/${transactionId}`
        );

        if (res.data.status === 'success') {
          showAlert('success', 'Transaction Approved successfully!');
          button.textContent = 'Approve';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Approve';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

if (declineTransactionBtn) {
  declineTransactionBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const transactionId = button.dataset.transactionId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(
          `/api/v1/transactions/decline-transaction/${transactionId}`
        );

        if (res.data.status === 'success') {
          showAlert('success', 'Transaction Declined successfully!');
          button.textContent = 'Decline';
          button.opacity = '1';
          button.disabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Decline';
        button.opacity = '1';
        button.disabled = false;
      }
    });
  });
}

const editWalletModal = document.querySelectorAll('.edit-wallet-modal-btn');
const editWalletBtn = document.querySelector('.edit-wallet-btn');
let walletId = null;
editWalletModal.forEach((button) => {
  button.addEventListener('click', function () {
    walletId = this.dataset.walletId;
  });
});
if (editWalletBtn) {
  editWalletBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!walletId) return;
    editWalletBtn.style.opacity = '0.5';
    editWalletBtn.ariaDisabled = true;
    editWalletBtn.textContent = 'Saving...';
    const info = {
      name: document.getElementById('wallet1').value,
      address: document.getElementById('address1').value,
    };
    try {
      const response = await axios.patch(
        `/api/v1/wallets/edit-wallet/${walletId}`,
        info
      );
      if (response.data.status === 'success') {
        showAlert('success', 'Wallet Edit successful!');
        window.setTimeout(() => {
          location.reload();
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      showAlert(
        'error',
        err.response ? err.response.data.message : 'Error Sending Reply'
      );
    } finally {
      editWalletBtn.style.opacity = '1';
      editWalletBtn.disabled = false;
      editWalletBtn.textContent = 'Edit Wallet';
    }
  });
}

const approveLoanBtn = document.querySelectorAll('.approve-loan-btn');
const declineLoanBtn = document.querySelectorAll('.decline-loan-btn');

if (approveLoanBtn) {
  approveLoanBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const loanId = button.dataset.loanId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(`/api/v1/loans/approve-loan/${loanId}`);

        if (res.data.status === 'success') {
          showAlert('success', 'Loan Approved successfully!');
          button.textContent = 'Approve';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Approve';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

if (declineLoanBtn) {
  declineLoanBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const loanId = button.dataset.loanId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(`/api/v1/loans/decline-loan/${loanId}`);

        if (res.data.status === 'success') {
          showAlert('success', 'Loan Declined successfully!');
          button.textContent = 'Decline';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Decline';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

const approveCardBtn = document.querySelectorAll('.approve-card-btn');
const declineCardBtn = document.querySelectorAll('.decline-card-btn');

if (declineCardBtn) {
  declineCardBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const cardId = button.dataset.cardId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(
          `/api/v1/card-applications/decline-card-application/${cardId}`
        );

        if (res.data.status === 'success') {
          showAlert('success', 'Card Declined successfully!');
          button.textContent = 'Decline';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Decline';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

if (approveCardBtn) {
  approveCardBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const cardId = button.dataset.cardId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(
          `/api/v1/card-applications/approve-card-application/${cardId}`
        );

        if (res.data.status === 'success') {
          showAlert('success', 'Card Approved successfully!');
          button.textContent = 'Approve';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Approve';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

const replySupportModal = document.querySelectorAll('.reply-support-modal-btn');
const replySupportBtn = document.querySelector('.reply-support-btn');
let supportId = null;

replySupportModal.forEach((button) => {
  button.addEventListener('click', function () {
    supportId = this.dataset.supportId;
  });
});

if (replySupportBtn) {
  replySupportBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!supportId) return;

    replySupportBtn.style.opacity = '0.5';
    replySupportBtn.ariaDisabled = true;
    replySupportBtn.textContent = 'Sending...';

    const info = {
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value,
    };

    try {
      const response = await axios.post(
        `/api/v1/supports/reply-support/${supportId}`,
        info
      );

      if (response.data.status === 'success') {
        showAlert('success', 'Reply Sent successfully!');
        window.setTimeout(() => {
          location.reload();
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      showAlert(
        'error',
        err.response ? err.response.data.message : 'Error Sending Reply'
      );
    } finally {
      replySupportBtn.style.opacity = '1';
      replySupportBtn.disabled = false;
      replySupportBtn.textContent = 'Save Message';
    }
  });
}

const editTransactionModal = document.querySelectorAll(
  '.edit-transaction-modal-btn'
);
const editTransactionBtn = document.querySelector('.edit-transaction-btn');
let transactionId = null;

editTransactionModal.forEach((button) => {
  button.addEventListener('click', function () {
    transactionId = this.dataset.transactionId;
  });
});

if (editTransactionBtn) {
  editTransactionBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!transactionId) return;

    editTransactionBtn.style.opacity = '0.5';
    editTransactionBtn.ariaDisabled = true;
    editTransactionBtn.textContent = 'Saving...';

    const info = {
      amount: document.getElementById('amount').value,
      type: document.getElementById('type').value,
      gateway: document.getElementById('gateway').value,
      old: document.getElementById('time').value,
      status: document.getElementById('status').value,
      date: document.getElementById('date').value,
    };

    try {
      const response = await axios.patch(
        `/api/v1/transactions/admin/edit-transaction/${transactionId}`,
        info
      );

      if (response.data.status === 'success') {
        showAlert('success', 'Transaction Edit successful!');
        window.setTimeout(() => {
          location.reload();
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      showAlert(
        'error',
        err.response ? err.response.data.message : 'Error Sending Reply'
      );
    } finally {
      editTransactionBtn.style.opacity = '1';
      editTransactionBtn.disabled = false;
      editTransactionBtn.textContent = 'edit Transaction';
    }
  });
}

const sendMailModal = document.querySelectorAll('.send-mail-modal-btn');
const sendMailBtn = document.querySelector('.send-mail-btn');
let userId = null;

sendMailModal.forEach((button) => {
  button.addEventListener('click', function () {
    userId = this.dataset.userId;
  });
});

if (sendMailBtn) {
  sendMailBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!userId) return;

    sendMailBtn.style.opacity = '0.5';
    sendMailBtn.ariaDisabled = true;
    sendMailBtn.textContent = 'Sending...';

    const info = {
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value,
    };

    try {
      const response = await axios.post(
        `/api/v1/supports/send-mail/${userId}`,
        info
      );

      if (response.data.status === 'success') {
        showAlert('success', 'Mail Sent successfully!');
        window.setTimeout(() => {
          location.reload();
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      showAlert(
        'error',
        err.response ? err.response.data.message : 'Error Sending Reply'
      );
    } finally {
      sendMailBtn.style.opacity = '1';
      sendMailBtn.disabled = false;
      sendMailBtn.textContent = 'Save Message';
    }
  });
}

const editUserBalanceModal = document.querySelectorAll(
  '.edit-user-balance-modal-btn'
);
const editUserBalanceBtn = document.querySelector('.edit-user-balance-btn');

editUserBalanceModal.forEach((button) => {
  button.addEventListener('click', function () {
    userId = this.dataset.userId;
  });
});

if (editUserBalanceBtn) {
  editUserBalanceBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!userId) return;

    editUserBalanceBtn.style.opacity = '0.5';
    editUserBalanceBtn.ariaDisabled = true;
    editUserBalanceBtn.textContent = 'Updating...';

    const info = {
      type: document.getElementById('type').value,
      wallet: document.getElementById('wallet').value,
      amount: document.getElementById('amount').value,
    };

    try {
      const response = await axios.post(
        `/api/v1/transactions/direct-deposit/${userId}`,
        info
      );

      if (response.data.status === 'success') {
        showAlert('success', 'Success!');
        window.setTimeout(() => {
          location.reload();
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      showAlert(
        'error',
        err.response ? err.response.data.message : 'Error Editing Balance'
      );
    } finally {
      editUserBalanceBtn.style.opacity = '1';
      editUserBalanceBtn.disabled = false;
      editUserBalanceBtn.textContent = 'Save';
    }
  });
}

const resendOtpBtn = document.querySelector('.resend-otp-btn');
if (resendOtpBtn) {
  resendOtpBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const userId = window.location.pathname.split('/').pop();
    resendOtpBtn.textContent = 'Sending...';
    resendOtpBtn.opacity = '0.5';
    resendOtpBtn.disabled = true;
    try {
      const res = await axios.post(`/api/v1/users/resend-otp/${userId}`);

      if (res.data.status === 'success') {
        showAlert('success', 'OTP sent successfully!');
        resendOtpBtn.textContent = 'Resend OTP';
        resendOtpBtn.opacity = '1';
        resendOtpBtn.disabled = false;
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
      resendOtpBtn.textContent = 'Resend OTP';
      resendOtpBtn.opacity = '1';
      resendOtpBtn.disabled = false;
    }
  });
}

const activateAccountBTn = document.querySelectorAll('.activate-account-btn');
const deactivateAccountBtn = document.querySelectorAll(
  '.deactivate-account-btn'
);

if (deactivateAccountBtn) {
  deactivateAccountBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const userId = button.dataset.userId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(
          `/api/v1/users/deactivate-account/${userId}`
        );

        if (res.data.status === 'success') {
          showAlert('success', 'Account Deactivated successfully!');
          button.textContent = 'Deactivate Account';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Deactivate Account';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

if (activateAccountBTn) {
  activateAccountBTn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const userId = button.dataset.userId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(
          `/api/v1/users/activate-account/${userId}`
        );

        if (res.data.status === 'success') {
          showAlert('success', 'Activated Account successfully!');
          button.textContent = 'Activate Account';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Activate Account';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

const activateTransferBTn = document.querySelectorAll('.activate-transfer-btn');
const deactivateTransferBtn = document.querySelectorAll(
  '.deactivate-transfer-btn'
);

if (deactivateTransferBtn) {
  deactivateTransferBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const userId = button.dataset.userId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(
          `/api/v1/users/deactivate-transfer/${userId}`
        );

        if (res.data.status === 'success') {
          showAlert(
            'success',
            'All transfers from this account will now be successful!'
          );
          button.textContent = 'Deactivate Transfer';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Deactivate Transfer';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

if (activateTransferBTn) {
  activateTransferBTn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const userId = button.dataset.userId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(
          `/api/v1/users/activate-transfer/${userId}`
        );

        if (res.data.status === 'success') {
          showAlert(
            'success',
            'All transfers from this account will now be normal!'
          );
          button.textContent = 'Activate Transfer';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Activate Transfer';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

const approveKycBtn = document.querySelectorAll('.approve-kyc-btn');
const declineKycBtn = document.querySelectorAll('.decline-kyc-btn');

if (approveKycBtn) {
  approveKycBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const kycId = button.dataset.kycId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(`/api/v1/kyc/approve-kyc/${kycId}`);

        if (res.data.status === 'success') {
          showAlert('success', 'Kyc Approved successfully!');
          button.textContent = 'Approve';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Approve';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}

if (declineKycBtn) {
  declineKycBtn.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const kycId = button.dataset.kycId;

      button.textContent = 'Processing...';
      button.opacity = '0.5';
      button.ariaDisabled = true;

      try {
        const res = await axios.patch(`/api/v1/kyc/decline-kyc/${kycId}`);

        if (res.data.status === 'success') {
          showAlert('success', 'Kyc Declined successfully!');
          button.textContent = 'Decline';
          button.opacity = '1';
          button.ariaDisabled = false;

          window.setTimeout(() => {
            location.reload();
          }, 3000);
        }
      } catch (err) {
        showAlert('error', err.response.data.message);
        button.textContent = 'Decline';
        button.opacity = '1';
        button.ariaDisabled = false;
      }
    });
  });
}
