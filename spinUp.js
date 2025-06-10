const cron = require('node-cron');
const axios = require('axios');

function spinServer() {
  axios
    .get('https://veritasfounders.com/')
    .then((res) => {
      console.log('✅ Ping successful:', res.status);
    })
    .catch((err) => {
      console.error('❌ Ping failed:', err.message);
    });
}

module.exports = function () {
  cron.schedule('*/10 * * * *', () => {
    console.log('⏰ Running cron job every 10 minutes');
    spinServer();
  });
};
