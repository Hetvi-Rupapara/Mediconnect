const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors with optional search and specialization filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { search, specialization } = req.query;
    let query = {};

    // Filter by specific specialization if provided
    if (specialization) {
      query.specialization = specialization;
    }

    // Handle search query (searches name or specialization)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    // Find doctors matching query, sorting by name, populating user email
    const doctors = await Doctor.find(query).populate('user', 'email').sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    console.error('Fetch doctors list error:', error.message);
    res.status(500).json({ message: 'Server error retrieving doctor list' });
  }
});

/**
 * @route   GET /api/doctors/:id
 * @desc    Get detailed profile of a single doctor by database ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    // Find doctor by ID and populate their parent User info (name/email)
    const doctor = await Doctor.findById(req.params.id).populate('user', 'email');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Fetch doctor details error:', error.message);
    // Handle invalid mongoose object id format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.status(500).json({ message: 'Server error retrieving doctor details' });
  }
});

/**
 * @route   GET /api/doctors/profile/me
 * @desc    Get current doctor's profile details
 * @access  Private (Requires authentication and doctor role)
 */
router.get('/profile/me', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  try {
    const profile = await Doctor.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Fetch me profile error:', error.message);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
});

/**
 * @route   PUT /api/doctors/profile/availability
 * @desc    Update doctor's weekly available days
 * @access  Private (Requires authentication and doctor role)
 */
router.put('/profile/availability', auth, async (req, res) => {
  const { availability } = req.body;

  // Validate request body
  if (!availability || !Array.isArray(availability)) {
    return res.status(400).json({ message: 'Invalid availability configuration' });
  }

  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  try {
    const profile = await Doctor.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Update availability list and save
    profile.availability = availability;
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Update availability error:', error.message);
    res.status(500).json({ message: 'Server error saving availability schedule' });
  }
});

/**
 * @route   PUT /api/doctors/profile/me
 * @desc    Update doctor's detailed profile (name, specialization, experience, fees, hospital, bio)
 * @access  Private (Requires authentication and doctor role)
 */
router.put('/profile/me', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  const { name, specialization, experience, fees, hospital, bio } = req.body;

  // Simple validation
  if (!name || !specialization || !experience || !fees || !hospital) {
    return res.status(400).json({ message: 'Please provide all required profile fields' });
  }

  try {
    // Find doctor profile
    const profile = await Doctor.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Update doctor's name on their User record to keep it in sync
    const user = await User.findById(req.user.id);
    if (user) {
      user.name = name;
      await user.save();
    }

    // Update Doctor profile fields
    profile.name = name;
    profile.specialization = specialization;
    profile.experience = Number(experience);
    profile.fees = Number(fees);
    profile.hospital = hospital;
    profile.bio = bio || '';

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Update doctor profile error:', error.message);
    res.status(500).json({ message: 'Server error saving doctor profile' });
  }
});

/**
 * @route   PUT /api/doctors/profile/working-days
 * @desc    Save doctor's regular weekly working days
 * @access  Private (Requires authentication and doctor role)
 */
router.put('/profile/working-days', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  const { workingDays } = req.body;

  if (!workingDays || !Array.isArray(workingDays)) {
    return res.status(400).json({ message: 'Please provide working days as an array' });
  }

  try {
    const profile = await Doctor.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    profile.workingDays = workingDays;
    profile.availability = workingDays; // Sync for backward compatibility
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Save working days error:', error.message);
    res.status(500).json({ message: 'Server error saving working days schedule' });
  }
});

/**
 * @route   POST /api/doctors/profile/unavailable-dates
 * @desc    Add a specific unavailable date
 * @access  Private (Requires authentication and doctor role)
 */
router.post('/profile/unavailable-dates', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ message: 'Please provide an unavailable date' });
  }

  try {
    const profile = await Doctor.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Prevent duplicate entries
    if (!profile.unavailableDates.includes(date)) {
      profile.unavailableDates.push(date);
      // Sort dates chronologically for better organization
      profile.unavailableDates.sort();
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error('Add unavailable date error:', error.message);
    res.status(500).json({ message: 'Server error adding unavailable date' });
  }
});

/**
 * @route   DELETE /api/doctors/profile/unavailable-dates/:date
 * @desc    Remove a specific unavailable date
 * @access  Private (Requires authentication and doctor role)
 */
router.delete('/profile/unavailable-dates/:date', auth, async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  const { date } = req.params;

  try {
    const profile = await Doctor.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    profile.unavailableDates = profile.unavailableDates.filter(d => d !== date);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Remove unavailable date error:', error.message);
    res.status(500).json({ message: 'Server error removing unavailable date' });
  }
});

module.exports = router;
