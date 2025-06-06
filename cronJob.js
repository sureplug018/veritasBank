// /*const mongoose = require('mongoose');*/
// const cron = require('node-cron');
// const User = require('./models/userModel');
// const Plan = require('./models/planModel');
// const Investment = require('./models/investmentModel');

// // Function to delete unconfirmed users after a specific time
// async function deleteUnconfirmedUsers() {
//   try {
//     const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

//     const unconfirmedUsers = await User.find({
//       confirmed: false,
//       createdAt: { $lte: tenMinutesAgo },
//     });

//     for (const user of unconfirmedUsers) {
//       await User.deleteOne({ _id: user._id });
//       console.log(`Deleted unconfirmed user with ID: ${user._id}`);
//     }
//   } catch (error) {
//     console.error('Error deleting unconfirmed users:', error);
//   }
// }

// async function returnInvestment() {
//   try {
//     const investments = await Investment.find({ status: 'active' });
//     const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

//     investments.forEach(async (investment) => {
//       const plan = await Plan.findById(investment.plan);
//       const dailyInterest = (plan.roi / 100) * investment.amount; // Daily ROI
//       const duration = plan.duration * oneDay; // Total duration in milliseconds
//       const elapsedTime = Date.now() - investment.createdAt; // Time elapsed since investment started
//       const daysPassed = elapsedTime / oneDay; // Full days passed

//       if (
//         daysPassed % 1 === 0 &&
//         daysPassed < 7 &&
//         daysPassed > 0 &&
//         investment.status === 'active'
//       ) {
//         // Add daily interest to the profit balance
//         await User.findByIdAndUpdate(investment.user._id, {
//           $inc: {
//             profit: dailyInterest, // Increment profit balance
//           },
//         });

//         console.log(
//           `Day ${daysPassed}: Added daily interest for investment`,
//           investment
//         );

//         // On the 7th day, finalize the investment
//         if (daysPassed === 7) {
//           await Investment.findByIdAndUpdate(investment._id, {
//             status: 'ended',
//           });

//           await User.findByIdAndUpdate(investment.user._id, {
//             $inc: {
//               profit: dailyInterest, // Add last daily interest
//               balance: investment.amount, // Return the capital to the main balance
//             },
//           });

//           console.log('Investment duration completed. Finalized:', investment);
//         }
//       }
//     });
//   } catch (err) {
//     console.error('Error processing investments:', err.message);
//   }
// }

// // Schedule the cron job to run every 10 minutes
// module.exports = function () {
//   // Schedule the cron job to run every 10 minutes
//   cron.schedule('* * * * *', () => {
//     deleteUnconfirmedUsers();
//     returnInvestment();
//   });
// };
