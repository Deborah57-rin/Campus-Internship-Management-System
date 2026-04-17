const mongoose = require('mongoose');

/**
 * @returns {Promise<boolean>} true if connected
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI && String(process.env.MONGO_URI).trim();
  if (!uri) {
    console.error(
      'MongoDB: MONGO_URI is missing or empty. Add it to server/.env (see Atlas → Connect → Drivers).'
    );
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    const msg = error.message || String(error);
    console.error(`MongoDB connection failed: ${msg}`);

    if (msg.includes('querySrv') || msg.includes('ECONNREFUSED')) {
      console.error(
        '→ DNS/network: SRV lookup to Atlas failed. Try: different network/VPN off, set DNS to 8.8.8.8, or in Atlas use the "standard connection string" (mongodb://host1,host2/...) instead of mongodb+srv://.'
      );
    }
    if (msg.includes('IP') || msg.includes('whitelist') || msg.includes('not allowed')) {
      console.error(
        '→ Atlas Network Access: add your current IP (or 0.0.0.0/0 for dev only) under Network Access.'
      );
    }
    if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
      console.error(
        '→ Check database username/password in MONGO_URI. If the password has special characters, URL-encode it in the connection string.'
      );
    }
    return false;
  }
};

module.exports = connectDB;
