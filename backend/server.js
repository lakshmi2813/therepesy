const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ── Middleware ──
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/patients',    require('./routes/patients'));
app.use('/api/therapists',  require('./routes/therapists'));
app.use('/api/sessions',    require('./routes/sessions'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/moods',       require('./routes/moods'));
app.use('/api/dashboard',   require('./routes/dashboard'));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', hospital: 'MGM Hospital', timestamp: new Date() });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── Connect to MongoDB & Start Server ──
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgm_hospital';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 MGM Hospital API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
