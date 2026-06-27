const mongoose = require('mongoose');

// Define a beginner-friendly schema for Users (Patients and Doctors)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email address'],
    unique: true, // Prevent duplicate user emails
    trim: true,
    lowercase: true // Save email in lowercase to make search/login case-insensitive
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  role: {
    type: String,
    enum: ['patient', 'doctor'], // Restrict roles to patient or doctor for Version 1
    default: 'patient'
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  age: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically populate the current timestamp
  }
});

// Export the Mongoose model based on the schema
module.exports = mongoose.model('User', UserSchema);
