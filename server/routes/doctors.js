const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Doctor = require('../models/Doctor');

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

    // Find doctors matching query, sorting by name
    const doctors = await Doctor.find(query).sort({ name: 1 });
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

module.exports = router;
