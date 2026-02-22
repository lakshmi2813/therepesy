const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const { protect, authorize } = require('../middleware/auth');

// POST /api/moods — log mood (patient only)
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { mood, score, emoji, note, triggers, activities } = req.body;
    const entry = await Mood.create({ patient: req.user._id, mood, score, emoji, note, triggers, activities });
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/moods — get mood history
router.get('/', protect, async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user._id : req.query.patientId;
    if (!patientId) return res.status(400).json({ success: false, message: 'Patient ID required.' });

    const moods = await Mood.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(30);

    // Weekly summary
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyMoods = moods.filter(m => m.createdAt >= oneWeekAgo);
    const avgScore = weeklyMoods.length
      ? (weeklyMoods.reduce((s, m) => s + (m.score || 5), 0) / weeklyMoods.length).toFixed(1)
      : null;

    res.json({ success: true, moods, weeklyAvg: avgScore });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
