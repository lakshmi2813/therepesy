const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect, authorize } = require('../middleware/auth');

// GET /api/sessions
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'therapist') filter.therapist = req.user._id;
    if (req.user.role === 'patient')   filter.patient   = req.user._id;

    const { date, status } = req.query;
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lt:  new Date(d.setHours(23, 59, 59, 999))
      };
    }

    const sessions = await Session.find(filter)
      .populate('patient',  'name email')
      .populate('therapist','name email')
      .sort({ date: 1 });

    res.json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/sessions — schedule a session
router.post('/', protect, authorize('therapist', 'supervisor'), async (req, res) => {
  try {
    const { patientId, therapistId, date, duration, type, therapy, module, location } = req.body;
    const session = await Session.create({
      patient:   patientId,
      therapist: therapistId || req.user._id,
      date,
      duration,
      type,
      therapy,
      module,
      location
    });
    await session.populate('patient therapist');
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/sessions/:id — update session (add notes, change status)
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, notes, rating } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status, notes, rating },
      { new: true, runValidators: true }
    ).populate('patient therapist');

    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/sessions/today — today's sessions for logged-in user
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    const filter = {
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt:  new Date(today.setHours(23, 59, 59, 999))
      }
    };
    if (req.user.role === 'therapist') filter.therapist = req.user._id;
    if (req.user.role === 'patient')   filter.patient   = req.user._id;

    const sessions = await Session.find(filter)
      .populate('patient',  'name')
      .populate('therapist','name')
      .sort({ date: 1 });

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
