const nodemailer = require('nodemailer');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });
const ejs = require('ejs');
const path = require('path'); // Import path module

module.exports = class Mail {
  constructor(user, subject, transaction) {
    this.to = user.email;
    this.name = user.firstName; // Corrected splitting method
    this.subject = subject;
    this.from = '"Veritas Bank" <support@veritasfounders.com>';
    this.transaction = transaction;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the actual email
  async send(template) {
    try {
      const html = await ejs.renderFile(
        path.join(__dirname, `../views/email/${template}.ejs`), // Use path.join for correct file path
        {
          name: this.name,
          subject: this.subject,
          transaction: this.transaction,
        }
      );

      const $ = cheerio.load(html);

      // defining the email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject: this.subject,
        html,
        text: $.text(),
      };

      // creating a transport and sending the email
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      // Handle error or throw it for higher-level handling
      throw new Error('Failed to send email');
    }
  }

  async sendPendingTransaction() {
    try {
      await this.send('pendingTransaction');
    } catch (error) {
      // Handle error for sendPasswordReset method
      console.error('Sending transaction notification email failed:', error);
      // Optionally, you can throw the error again for higher-level handling
      throw new Error('Failed to send order notification email');
    }
  }

  async sendConfirmedTransaction() {
    try {
      await this.send('confirmTransaction');
    } catch (error) {
      // Handle error for sendPasswordReset method
      console.error('Sending transaction confirmation email failed:', error);
      // Optionally, you can throw the error again for higher-level handling
      throw new Error('Failed to send order cancellation email');
    }
  }

  async notifyAdminOnCardApplication() {
    try {
      await this.send('notifyAdminOnCardApplication');
    } catch (error) {
      // Handle error for sendPasswordReset method
      console.error('Sending card notification email failed:', error);
      // Optionally, you can throw the error again for higher-level handling
      throw new Error('Failed to send email');
    }
  }

  async approveCardEmail() {
    try {
      await this.send('approveCardEmail');
    } catch (error) {
      console.log('Send Acknowledgement email failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async approveLoanEmail() {
    try {
      await this.send('approveLoanEmail');
    } catch (error) {
      console.log('Send Acknowledgement email failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async notifyUserOnSuccessfulTransaction() {
    try {
      await this.send('notifyUserOnSuccessfulTransaction');
    } catch (error) {
      console.log('Send Acknowledgement email failed:', error);
      console.log('Mail Sent');
      throw new Error('Failed to send email');
    }
  }

  async sendMailToAllUsers() {
    try {
      await this.send('sendMailToAllUsers');
    } catch (error) {
      console.log('Send Acknowledgement email failed:', error);
      console.log('Mail Sent');
      throw new Error('Failed to send email');
    }
  }

  async directDeposit() {
    try {
      await this.send('directDeposit');
    } catch (error) {
      console.log('Send Acknowledgement email failed:', error);
      console.log('Mail Sent');
      throw new Error('Failed to send email');
    }
  }
};
