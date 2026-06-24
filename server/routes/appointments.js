const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

/**
 * @route   POST /api/appointments
 * @desc    Book a new appointment
 * @access  Private (Requires authentication)
 */
router.post('/', auth, async (req, res) => {
  const { doctor, date, timeSlot, symptoms } = req.body;

  // Simple validation
  if (!doctor || !date || !timeSlot) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    // Check if the doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({ message: 'Selected doctor not found' });
    }

    // Create a new Appointment record
    const appointment = new Appointment({
      patient: req.user.id, // Populated from authentication middleware token
      doctor,
      date,
      timeSlot,
      symptoms
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Book appointment error:', error.message);
    res.status(500).json({ message: 'Server error booking appointment' });
  }
});

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for the logged-in patient
 * @access  Private (Requires authentication)
 */
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Check role from auth token
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      // Find doctor profile belonging to this user ID
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (doctorProfile) {
        query.doctor = doctorProfile._id;
      } else {
        // Return empty array if doctor profile does not exist
        return res.json([]);
      }
    }

    // Find and return appointments, populating doctor profile details and patient names
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization hospital')
      .populate('patient', 'name email')
      .sort({ date: 1 }); // Sort by chronological order

    res.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error.message);
    res.status(500).json({ message: 'Server error retrieving appointments' });
  }
});

/**
 * @route   GET /api/appointments/booked
 * @desc    Get booked/unavailable time slots for a doctor on a specific date
 * @access  Private (Requires authentication)
 */
router.get('/booked', auth, async (req, res) => {
  const { doctor, date } = req.query;

  if (!doctor || !date) {
    return res.status(400).json({ message: 'Please provide doctor ID and date' });
  }

  try {
    // Setup date range for the requested date (00:00:00 to 23:59:59)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Retrieve accepted or completed appointments for this doctor on this day
    const appointments = await Appointment.find({
      doctor,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['accepted', 'completed'] }
    }).select('timeSlot');

    // Extract timeslot strings and send response
    const bookedSlots = appointments.map((app) => app.timeSlot);
    res.json(bookedSlots);
  } catch (error) {
    console.error('Fetch booked slots error:', error.message);
    res.status(500).json({ message: 'Server error retrieving booked slots' });
  }
});

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel an appointment (Safely deletes the record)
 * @access  Private (Requires authentication)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Security check: Patients can only delete/cancel their own appointments
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to cancel this appointment' });
    }

    // Security check: Doctors can only delete/cancel appointments assigned to them
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to cancel this appointment' });
      }
    }

    // Safely delete the appointment document
    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
});

/**
 * @route   GET /api/appointments/today
 * @desc    Get today's appointments for the logged-in doctor
 * @access  Private (Requires authentication and doctor role)
 */
router.get('/today', auth, async (req, res) => {
  // Ensure the logged-in user is a doctor
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  try {
    // Find the doctor profile belonging to this user
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Set up range for today (00:00:00 to 23:59:59)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Retrieve today's appointments, populating patient details
    const appointments = await Appointment.find({
      doctor: doctorProfile._id,
      date: { $gte: startOfToday, $lte: endOfToday }
    })
    .populate('patient', 'name email')
    .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Fetch today appointments error:', error.message);
    res.status(500).json({ message: 'Server error retrieving today\'s appointments' });
  }
});

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Update appointment status (accept, reject, or complete)
 * @access  Private (Requires authentication and doctor role)
 */
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;

  // Validate status input value
  if (!status || !['accepted', 'rejected', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update request' });
  }

  // Ensure role is doctor
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  try {
    // Find the doctor profile
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find the appointment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Security check: Verify doctor owns this appointment
    if (appointment.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to modify this appointment' });
    }

    // Update appointment status and save
    appointment.status = status;
    await appointment.save();

    // Populate patient details and return the updated appointment record
    const updatedApp = await Appointment.findById(appointment._id)
      .populate('patient', 'name email');

    res.json(updatedApp);
  } catch (error) {
    console.error('Update status error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(500).json({ message: 'Server error updating appointment status' });
  }
});

module.exports = router;
