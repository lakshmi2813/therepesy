const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth');

// GET /api/patients — list patients
router.get('/', protect, authorize('therapist', 'supervisor'), async (req, res) => {
  try {
    let patients;
    if (req.user.role === 'supervisor') {
      patients = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
    } else {
      // Therapist: only their assigned patients
      const assignments = await Assignment.find({ therapist: req.user._id, status: 'active' }).select('patient');
      const ids = assignments.map(a => a.patient);
      patients = await User.find({ _id: { $in: ids } }).select('-password');
    }
    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patients/:id — single patient details with assignment + sessions
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('-password');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const assignment = await Assignment.findOne({ patient: req.params.id, status: 'active' })
      .populate('therapist', 'name email specializations extension');

    const sessions = await Session.find({ patient: req.params.id })
      .populate('therapist', 'name')
      .sort({ date: -1 })
      .limit(10);

    const sessionCount = await Session.countDocuments({ patient: req.params.id, status: 'completed' });

    res.json({ success: true, patient, assignment, sessions, sessionCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
