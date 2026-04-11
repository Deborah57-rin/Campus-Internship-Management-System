const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUsers = async () => {
  try {
    const usersToSeed = [
      {
        name: 'Internship Officer',
        email: 'naomi.wanjiru@usiu.ac.ke',
        password: 'Admin123!',
        role: 'admin',
      },
      {
        name: 'Dr. Grace Wanjiku',
        email: 'grace.wanjiku@usiu.ac.ke',
        password: 'Lecturer123!',
        role: 'lecturer',
      },
      {
        name: 'Mr. Kevin Otieno',
        email: 'kevin.otieno@usiu.ac.ke',
        password: 'Lecturer123!',
        role: 'lecturer',
      },
      {
        name: 'Ms. Lydia Achieng',
        email: 'lydia.achieng@usiu.ac.ke',
        password: 'Lecturer123!',
        role: 'lecturer',
      },
      {
        name: 'Dr. Brian Mwangi',
        email: 'brian.mwangi@usiu.ac.ke',
        password: 'Lecturer123!',
        role: 'lecturer',
      },
      {
        name: 'Prof. Ruth Njeri',
        email: 'ruth.njeri@usiu.ac.ke',
        password: 'Lecturer123!',
        role: 'lecturer',
      },
      {
        name: 'Mr. Dennis Kiptoo',
        email: 'dennis.kiptoo@usiu.ac.ke',
        password: 'Lecturer123!',
        role: 'lecturer',
      },
      {
        name: 'Amina Hassan',
        email: 'amina.hassan@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Brian Kiprono',
        email: 'brian.kiprono@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Caroline Naliaka',
        email: 'caroline.naliaka@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Daniel Mwenda',
        email: 'daniel.mwenda@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Edith Wambui',
        email: 'edith.wambui@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Felix Onyango',
        email: 'felix.onyango@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Gloria Mutiso',
        email: 'gloria.mutiso@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Henry Kirui',
        email: 'henry.kirui@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Irene Akinyi',
        email: 'irene.akinyi@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
      {
        name: 'Joseph Kamau',
        email: 'joseph.kamau@usiu.ac.ke',
        password: 'Student123!',
        role: 'student',
      },
    ];

    for (const userData of usersToSeed) {
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() }).select('+password');

      if (existingUser) {
        existingUser.name = userData.name;
        existingUser.role = userData.role;
        existingUser.password = userData.password; // re-hashed by model hook
        await existingUser.save();
        console.log('User Updated:', existingUser.email);
      } else {
        const created = await User.create(userData);
        console.log('User Created:', created.email);
      }
    }

    console.log('Seeding complete: admin, 6 lecturers, 10 students.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();