const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/assignments — all assignments (supervisor) or own (therapist/patient)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'therapist') filter.therapist = req.user._id;
    if (req.user.role === 'patient')   filter.patient   = req.user._id;

    const assignments = await Assignment.find(filter)
      .populate('patient',   'name email phone gender dateOfBirth')
      .populate('therapist', 'name email specializations department extension')
      .populate('supervisor','name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/assignments/unassigned-patients — patients with no active assignment
router.get('/unassigned-patients', protect, authorize('supervisor'), async (req, res) => {
  try {
    const assignedPatientIds = await Assignment.distinct('patient', { status: 'active' });
    const unassigned = await User.find({
      role: 'patient',
      _id: { $nin: assignedPatientIds }
    }).select('name email gender dateOfBirth phone createdAt');

    res.json({ success: true, count: unassigned.length, patients: unassigned });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/assignments — supervisor creates assignment
router.post('/', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { patientId, therapistId, priority, diagnosis, treatmentPlan, notes } = req.body;

    // Check patient exists and is a patient
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    // Check therapist exists
    const therapist = await User.findOne({ _id: therapistId, role: 'therapist' });
    if (!therapist) return res.status(404).json({ success: false, message: 'Therapist not found.' });

    // Check if patient already has active assignment
    const existing = await Assignment.findOne({ patient: patientId, status: 'active' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Patient already has an active assignment. Transfer or end current assignment first.' });
    }

    const assignment = await Assignment.create({
      patient: patientId,
      therapist: therapistId,
      supervisor: req.user._id,
      priority,
      diagnosis,
      treatmentPlan,
      notes
    });

    await assignment.populate(['patient', 'therapist', 'supervisor']);
    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/assignments/:id — update assignment status or transfer
router.put('/:id', protect, authorize('supervisor'), async (req, res) => {
  try {
    const { status, therapistId, notes } = req.body;
    const update = { notes };
    if (status) update.status = status;
    if (therapistId) {
      const therapist = await User.findOne({ _id: therapistId, role: 'therapist' });
      if (!therapist) return res.status(404).json({ success: false, message: 'Therapist not found.' });
      update.therapist = therapistId;
    }
    if (status === 'completed' || status === 'cancelled') update.endDate = new Date();

    const assignment = await Assignment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('patient therapist supervisor');

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/assignments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('patient therapist supervisor');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
