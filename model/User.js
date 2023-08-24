const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
    min: 6
  },
  createAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', userSchema);