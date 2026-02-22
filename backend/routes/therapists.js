const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Session = require('../models/Session');
const { protect, authorize } = require('../middleware/auth');

// GET /api/therapists
router.get('/', protect, authorize('supervisor'), async (req, res) => {
  try {
    const therapists = await User.find({ role: 'therapist' }).select('-password');

    // Attach caseload count to each
    const enriched = await Promise.all(
      therapists.map(async (t) => {
        const caseload = await Assignment.countDocuments({ therapist: t._id, status: 'active' });
        const todaySessions = await Session.countDocuments({
          therapist: t._id,
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt:  new Date(new Date().setHours(23, 59, 59, 999))
          }
        });
        return { ...t.toObject(), caseload, todaySessions };
      })
    );

    res.json({ success: true, count: enriched.length, therapists: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/therapists/:id — therapist profile + their patients
router.get('/:id', protect, async (req, res) => {
  try {
    const therapist = await User.findOne({ _id: req.params.id, role: 'therapist' }).select('-password');
    if (!therapist) return res.status(404).json({ success: false, message: 'Therapist not found.' });

    const assignments = await Assignment.find({ therapist: req.params.id, status: 'active' })
      .populate('patient', 'name email dateOfBirth gender');

    res.json({ success: true, therapist, patients: assignments.map(a => a.patient), caseload: assignments.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
