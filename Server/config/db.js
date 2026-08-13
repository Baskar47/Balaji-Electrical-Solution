const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/balaji_electricals');
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    console.log('[MongoDB Notice] Ensure MongoDB daemon is running locally or specify MONGODB_URI in Server/.env');
  }
};

module.exports = connectDB;
