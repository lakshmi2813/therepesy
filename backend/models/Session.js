const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    patient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignment:{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    date:      { type: Date, required: true },
    duration:  { type: Number, default: 50 }, // minutes
    type:      {
      type: String,
      enum: ['individual', 'group', 'family', 'assessment', 'follow-up'],
      default: 'individual'
    },
    therapy:   String, // e.g. "CBT", "DBT", "EMDR"
    module:    String,
    status:    {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },
    location:  String,
    // Session notes (therapist fills after session)
    notes: {
      summary:    String,
      mood:       String,
      nextSteps:  String,
      homework:   String,
      riskLevel:  { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
    },
    rating:    { type: Number, min: 1, max: 5 } // patient rates session
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', SessionSchema);
