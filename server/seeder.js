const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUsers = async () => {
  try {
    // Clear existing users (Optional, be careful in prod)
    // await User.deleteMany(); 

    const admin = await User.create({
      name: 'Internship Officer',
      email: 'admin@usiu.ac.ke',
      password: 'Admin123!', // Will be hashed by model hook
      role: 'admin'
    });

    console.log('Admin User Created:', admin.email);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();