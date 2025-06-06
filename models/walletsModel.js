const mongoose = require('mongoose');

const walletsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A wallet must have a name'],
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'A wallet must have an address'],
    trim: true,
  },
});

const Wallet = mongoose.model('Wallet', walletsSchema);

module.exports = Wallet;
