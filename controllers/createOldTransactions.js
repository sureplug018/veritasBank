// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config({ path: '../config.env' }); // Make sure the path is correct
// const Transaction = require('../models/transactionModel');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
// console.log(DB);

// mongoose
//   .connect(DB, {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log('Successfully connected to the database');
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// // Function to generate random amounts
// function getRandomAmount() {
//   const amounts = [
//     100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000,
//   ];
//   return amounts[Math.floor(Math.random() * amounts.length)];
// }

// // Function to generate random dates from last year
// function getRandomDate() {
//   const start = new Date(new Date().getFullYear() - 1, 0, 1); // January 1st, last year
//   const end = new Date(new Date().getFullYear(), 0, 1); // January 1st, this year
//   const randomDate = new Date(
//     start.getTime() + Math.random() * (end.getTime() - start.getTime())
//   );
//   return randomDate; // Return Date object directly
// }

// // Function to generate random time
// function getRandomTime() {
//   const hour = Math.floor(Math.random() * 12) + 1;
//   const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
//   const period = Math.random() > 0.5 ? 'AM' : 'PM';
//   return `${hour}:${minute} ${period}`;
// }

// function getStatus() {
//   const statuses = Array(15).fill('confirmed').concat(['declined']); // 15 'confirmed' and 1 'declined'
//   return statuses[Math.floor(Math.random() * statuses.length)];
// }

// // Function to generate random transaction type
// function getRandomType() {
//   const types = ['transfer', 'deposit'];
//   return types[Math.floor(Math.random() * types.length)];
// }

// // Function to generate random gateway
// function getRandomGateway() {
//   const gateways = [
//     'Credit Card',
//     'Crypto',
//     'International Transfer',
//     'Inter-Bank Transfer',
//     'Local Transfer',
//     'Zelle',
//   ];
//   return gateways[Math.floor(Math.random() * gateways.length)];
// }

// // Generate Random Data
// function generateRandomTransaction() {
//   return {
//     amount: getRandomAmount(),
//     date: getRandomDate(),
//     time: getRandomTime(),
//     type: getRandomType(),
//     gateway: getRandomGateway(), // Added gateway
//     old: true,
//     status: getStatus(),
//   };
// }

// // Example: Generate 10 random transactions
// const transactions = Array.from({ length: 71 }, generateRandomTransaction);
// console.log(transactions);

// // Save the transactions to the database
// Transaction.create(transactions)
//   .then((doc) => {
//     console.log('Transactions saved successfully:', doc);
//   })
//   .catch((err) => {
//     console.log('Error saving transactions:', err);
//   });
