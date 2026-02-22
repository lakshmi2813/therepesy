const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema(
  {
    patient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mood:      { type: String, required: true },
    score:     { type: Number, min: 1, max: 10 }, // 1=very bad, 10=excellent
    emoji:     String,
    note:      String,
    triggers:  [String],
    activities:[String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mood', MoodSchema);
