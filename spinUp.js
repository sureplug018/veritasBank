const cron = require('node-cron');
const fetch = require('node-fetch'); // or use axios

function spinServer() {
  fetch('https://veritasfounders.com/') // use your real domain
    .then((res) => {
      if (res.ok) {
        console.log('✅ Ping successful');
      } else {
        console.error('❌ Ping failed with status:', res.status);
      }
    })
    .catch((err) => {
      console.error('❌ Ping failed:', err.message);
    });
}

module.exports = function () {
  cron.schedule('*/10 * * * *', () => {
    console.log('Running cron job every minute');
    // Here you can call the function to process investments
    spinServer();
  });
};
