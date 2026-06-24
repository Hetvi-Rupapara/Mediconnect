const mongoose = require('mongoose');

// Define a beginner-friendly schema for Appointments
const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add an appointment date']
  },
  timeSlot: {
    type: String,
    required: [true, 'Please select a preferred time slot']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending' // Appointments start in pending status
  },
  symptoms: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the model
module.exports = mongoose.model('Appointment', AppointmentSchema);
