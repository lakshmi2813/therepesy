const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth');

// GET /api/dashboard/supervisor
router.get('/supervisor', protect, authorize('supervisor'), async (req, res) => {
  try {
    const [totalTherapists, totalPatients, totalSessions] = await Promise.all([
      User.countDocuments({ role: 'therapist', isActive: true }),
      User.countDocuments({ role: 'patient' }),
      Session.countDocuments()
    ]);

    const assignedIds = await Assignment.distinct('patient', { status: 'active' });
    const unassigned  = await User.countDocuments({ role: 'patient', _id: { $nin: assignedIds } });

    const today = new Date();
    const todaySessions = await Session.countDocuments({
      date: {
        $gte: new Date(today.setHours(0,0,0,0)),
        $lt:  new Date(today.setHours(23,59,59,999))
      }
    });

    const cancelledToday = await Session.countDocuments({
      status: 'cancelled',
      date: {
        $gte: new Date(new Date().setHours(0,0,0,0)),
        $lt:  new Date(new Date().setHours(23,59,59,999))
      }
    });

    // Therapist caseload breakdown
    const therapists = await User.find({ role: 'therapist', isActive: true }).select('name');
    const caseloads = await Promise.all(
      therapists.map(async (t) => ({
        name: t.name,
        caseload: await Assignment.countDocuments({ therapist: t._id, status: 'active' })
      }))
    );

    res.json({
      success: true,
      stats: { totalTherapists, totalPatients, totalSessions, unassigned, todaySessions, cancelledToday },
      caseloads
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/therapist
router.get('/therapist', protect, authorize('therapist'), async (req, res) => {
  try {
    const activePatients = await Assignment.countDocuments({ therapist: req.user._id, status: 'active' });
    const completedSessions = await Session.countDocuments({ therapist: req.user._id, status: 'completed' });

    const today = new Date();
    const todaySessions = await Session.find({
      therapist: req.user._id,
      date: {
        $gte: new Date(today.setHours(0,0,0,0)),
        $lt:  new Date(today.setHours(23,59,59,999))
      }
    }).populate('patient','name').sort({ date: 1 });

    // Rating average
    const ratingAgg = await Session.aggregate([
      { $match: { therapist: req.user._id, rating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const avgRating = ratingAgg[0]?.avg?.toFixed(1) || 'N/A';

    res.json({
      success: true,
      stats: { activePatients, completedSessions, todayCount: todaySessions.length, avgRating },
      todaySessions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/patient
router.get('/patient', protect, authorize('patient'), async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ patient: req.user._id, status: 'active' })
      .populate('therapist', 'name email specializations extension department');

    const completedSessions = await Session.countDocuments({ patient: req.user._id, status: 'completed' });

    const upcoming = await Session.find({
      patient: req.user._id,
      status: 'scheduled',
      date: { $gte: new Date() }
    }).populate('therapist','name').sort({ date: 1 }).limit(3);

    res.json({
      success: true,
      assignment,
      stats: { completedSessions },
      upcoming
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
