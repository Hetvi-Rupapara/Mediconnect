// Import mongoose to interact with MongoDB
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDatabase } = require('../utils/seeder');

/**
 * Establish a connection to the MongoDB database.
 * Falls back to an in-memory database and auto-seeds if the configured connection fails.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment.');
    }

    console.log(`Attempting connection to MongoDB: ${mongoUri}`);
    // Connect to MongoDB using the MONGO_URI environment variable
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Fast timeout if the server isn't running
    });
    
    // Log success message to confirm connection
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed: ${error.message}`);
    console.log('Starting in-memory MongoDB database fallback (MongoMemoryServer)...');

    try {
      // Create and start an in-memory MongoDB instance
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      console.log(`In-memory MongoDB instance started at: ${memoryUri}`);

      // Connect Mongoose to the in-memory database
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB Connected to in-memory instance: ${conn.connection.host}`);

      // Auto-seed the database since in-memory is empty on start
      console.log('Seeding default doctor profiles to in-memory database...');
      await seedDatabase();
    } catch (fallbackError) {
      console.error(`Failed to start/connect/seed in-memory MongoDB: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

// Export the connection function to be used in server.js
module.exports = connectDB;
