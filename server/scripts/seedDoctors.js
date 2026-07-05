require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../config/db');
const { seedDatabase } = require('../utils/seeder');

const executeSeeding = async () => {
  try {
    await connectDB();
    // Since connectDB might have already seeded if it fell back to in-memory,
    // we run it again to make sure it's fully populated and verified.
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error.message);
    process.exit(1);
  }
};

executeSeeding();

