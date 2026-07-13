const mongoose = require('mongoose');

// Define a beginner-friendly schema for Doctor profiles
const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a doctor name'],
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience']
  },
  fees: {
    type: Number,
    required: [true, 'Please add consultation fees']
  },
  hospital: {
    type: String,
    required: [true, 'Please add hospital or clinic name'],
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  availability: {
    type: [String],
    default: [] // Array of days, e.g., ['Monday', 'Wednesday', 'Friday']
  },
  workingDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  unavailableDates: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the model
module.exports = mongoose.model('Doctor', DoctorSchema);
