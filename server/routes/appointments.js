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
    const doctorProfile = await Doctor.findById(doctor);
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Selected doctor not found' });
    }

    // 1. Prevent booking appointments in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ message: 'Appointments cannot be booked for past dates.' });
    }

    // 2. Validate selected weekday matches doctor's working days
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = daysOfWeek[selectedDate.getUTCDay()];
    const doctorWorkingDays = doctorProfile.workingDays && doctorProfile.workingDays.length > 0 
      ? doctorProfile.workingDays 
      : doctorProfile.availability;
    
    if (!doctorWorkingDays.includes(selectedDayName)) {
      return res.status(400).json({ message: 'The doctor is not available on this day.' });
    }

    // 3. Validate selected date is not in doctor's unavailable dates/holidays
    if (doctorProfile.unavailableDates && doctorProfile.unavailableDates.includes(date)) {
      return res.status(400).json({ message: 'The doctor is unavailable on this date. Please choose another date.' });
    }

    // 5. Parse time slot and validate it falls within doctor's working hours and matches specialty intervals
    const parseTime12h = (timeStr) => {
      const parts = (timeStr || '').match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!parts) return -1;
      let hours = parseInt(parts[1], 10);
      const minutes = parseInt(parts[2], 10);
      const ampm = parts[3].toUpperCase();
      
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      return hours * 60 + minutes;
    };

    const getSpecialtyDuration = (specialization) => {
      const spec = (specialization || '').trim().toLowerCase();
      if (spec.includes('general physician')) return 15;
      if (spec.includes('dermatologist')) return 15;
      if (spec.includes('pediatrician')) return 20;
      if (spec.includes('cardiologist')) return 30;
      return 30; // Fallback
    };

    const slotMins = parseTime12h(timeSlot);
    const startMins = parseTime12h(doctorProfile.startTime || '09:00 AM');
    const endMins = parseTime12h(doctorProfile.endTime || '05:00 PM');

    if (slotMins < 0 || startMins < 0 || endMins < 0) {
      return res.status(400).json({ message: 'Invalid time slot format.' });
    }

    // Must be between start and end hours
    if (slotMins < startMins || slotMins >= endMins) {
      return res.status(400).json({ message: "Selected time slot falls outside of the doctor's working hours." });
    }

    // Must align with the dynamic intervals starting from startTime
    const duration = getSpecialtyDuration(doctorProfile.specialization);
    if ((slotMins - startMins) % duration !== 0) {
      return res.status(400).json({ message: "Selected time slot does not align with the doctor's consultation slot duration." });
    }

    // Check if slot has already passed today
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    const selectedMidnight = new Date(selectedDate);
    selectedMidnight.setHours(0, 0, 0, 0);

    if (selectedMidnight.getTime() === todayMidnight.getTime()) {
      const nowHours = today.getHours();
      const nowMins = today.getMinutes();
      const nowTotal = nowHours * 60 + nowMins;
      
      if (slotMins <= nowTotal) {
        return res.status(400).json({ message: 'Selected time slot has already passed today.' });
      }
    }

    // 4. Validate double-booking: Check if the slot is already taken
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      timeSlot,
      status: { $in: ['pending', 'accepted', 'completed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
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
