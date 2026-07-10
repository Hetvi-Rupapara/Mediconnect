const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const healthRecordController = require('../controllers/healthRecordController');

// All endpoints require the client to supply a valid JWT header token
router.post('/', auth, healthRecordController.createRecord);
router.put('/:id', auth, healthRecordController.updateRecord);
router.get('/patient/:patientId', auth, healthRecordController.getPatientRecords);
router.get('/:id', auth, healthRecordController.getSingleRecord);

module.exports = router;
