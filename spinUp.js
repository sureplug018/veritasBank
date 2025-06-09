const cron = require('node-cron');

function spinServer() {
  app.get('/ping', (req, res) => {
    res.status(200).send('Server is alive');
    // console.log('Ping received, server is alive');
  });
}

module.exports = function () {
  cron.schedule('*/10 * * * *', () => {
    console.log('Running cron job every minute');
    // Here you can call the function to process investments
    spinServer();
  });
};
