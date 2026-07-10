const HealthRecord = require('../models/HealthRecord');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Create a new consultation record
// @route   POST /api/health-records
// @access  Private (Doctors only)
exports.createRecord = async (req, res) => {
  // Ensure the request is sent by a doctor
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  const { appointmentId, symptoms, diagnosisSummary, prescription, advice, followUpDate } = req.body;

  if (!appointmentId || !diagnosisSummary) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    // 1. Fetch Doctor profile belonging to the logged-in user
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // 2. Fetch the target appointment details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify this doctor matches the one assigned to the appointment
    if (appointment.doctor.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You are not the assigned doctor for this appointment' });
    }

    // 3. Prevent duplicate records for the same appointment
    const existingRecord = await HealthRecord.findOne({ appointmentId });
    if (existingRecord) {
      return res.status(400).json({ message: 'A health record already exists for this appointment' });
    }

    // 4. Create and save the new HealthRecord
    const healthRecord = new HealthRecord({
      patientId: appointment.patient,
      doctorId: doctorProfile._id,
      appointmentId,
      doctorName: doctorProfile.name,
      specialization: doctorProfile.specialization,
      visitDate: appointment.date,
      symptoms: symptoms || '',
      diagnosisSummary,
      prescription: prescription || '',
      advice: advice || '',
      followUpDate: followUpDate || null
    });

    await healthRecord.save();
    res.status(201).json(healthRecord);
  } catch (error) {
    console.error('Create health record error:', error.message);
    res.status(500).json({ message: 'Server error creating consultation record' });
  }
};

// @desc    Update an existing consultation record
// @route   PUT /api/health-records/:id
// @access  Private (Only the creator doctor)
exports.updateRecord = async (req, res) => {
  // Ensure the request is sent by a doctor
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied: Doctors only' });
  }

  const { symptoms, diagnosisSummary, prescription, advice, followUpDate } = req.body;

  if (!diagnosisSummary) {
    return res.status(400).json({ message: 'Diagnosis summary is required' });
  }

  try {
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const record = await HealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    // Verify creator doctor ownership
    if (record.doctorId.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You can only edit records you created' });
    }

    // Update fields
    record.symptoms = symptoms || '';
    record.diagnosisSummary = diagnosisSummary;
    record.prescription = prescription || '';
    record.advice = advice || '';
    record.followUpDate = followUpDate || null;

    await record.save();
    res.json(record);
  } catch (error) {
    console.error('Update health record error:', error.message);
    res.status(500).json({ message: 'Server error updating consultation record' });
  }
};

// @desc    Get all consultation records for a patient
// @route   GET /api/health-records/patient/:patientId
// @access  Private (Authorized patient or doctor)
exports.getPatientRecords = async (req, res) => {
  const { patientId } = req.params;

  // Patient can only view their own consultation records
  if (req.user.role === 'patient' && req.user.id !== patientId) {
    return res.status(403).json({ message: 'Access denied: Unauthorized patient' });
  }

  try {
    // Retrieve records, sorted newest first
    const records = await HealthRecord.find({ patientId })
      .sort({ visitDate: -1, createdAt: -1 });

    res.json(records);
  } catch (error) {
    console.error('Get patient health records error:', error.message);
    res.status(500).json({ message: 'Server error fetching patient records' });
  }
};

// @desc    Get a single health record details
// @route   GET /api/health-records/:id
// @access  Private (Authorized patient or creator doctor)
exports.getSingleRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    // Authorization checks: patient can only view their own; doctor can only view if they created it
    if (req.user.role === 'patient') {
      if (record.patientId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied: Unauthorized access to health record' });
      }
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user.id });
      if (!doctorProfile || record.doctorId.toString() !== doctorProfile._id.toString()) {
        return res.status(403).json({ message: 'Access denied: Unauthorized access to health record' });
      }
    }

    res.json(record);
  } catch (error) {
    console.error('Get single health record error:', error.message);
    res.status(500).json({ message: 'Server error fetching health record details' });
  }
};
