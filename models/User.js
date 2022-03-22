const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
  },
  age: {
    type: Number,
  },
  address: {
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },
  },
  phoneNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model('user', UserSchema);
