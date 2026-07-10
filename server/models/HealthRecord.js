const mongoose = require('mongoose');

// Define Mongoose Schema for Consultation Health Records
const HealthRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true // Ensure only one record is created per appointment session
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  symptoms: {
    type: String,
    trim: true
  },
  diagnosisSummary: {
    type: String,
    required: [true, 'Please add a diagnosis summary'],
    trim: true
  },
  prescription: {
    type: String,
    trim: true
  },
  advice: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
