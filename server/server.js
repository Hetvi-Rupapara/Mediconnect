// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize the Express application
const app = express();

// Connect to the MongoDB database
connectDB();

// Middleware: Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware: Parse incoming JSON requests
app.use(express.json());

// Import routes
const testRouter = require('./routes/test');
const authRouter = require('./routes/auth');
const doctorsRouter = require('./routes/doctors');
const appointmentsRouter = require('./routes/appointments');
const aiRouter = require('./routes/aiRoutes');
const healthRecordRouter = require('./routes/healthRecordRoutes');

// Mount routes
app.use('/api/test', testRouter);
app.use('/api/auth', authRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/health-records', healthRecordRouter);

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
