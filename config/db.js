const config = require('config');
const mongoose = require('mongoose');
const db = config.get('mongoURI');

// Connect to db function
const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log('db is connected!');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
