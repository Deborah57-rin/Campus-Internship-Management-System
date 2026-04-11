const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Do not crash the entire server in development.
    // Endpoints will still fail until MongoDB is reachable (e.g., Atlas IP whitelist).
  }
};

module.exports = connectDB;