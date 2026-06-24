// Import mongoose to interact with MongoDB
const mongoose = require('mongoose');

/**
 * Establish a connection to the MongoDB database using the URI configured in environment variables.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the MONGO_URI environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Log success message to confirm connection
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log any connection failure details
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit application process with failure code
    process.exit(1);
  }
};

// Export the connection function to be used in server.js
module.exports = connectDB;
