const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    patient:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    therapist:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status:     { type: String, enum: ['active', 'completed', 'transferred', 'cancelled'], default: 'active' },
    priority:   { type: String, enum: ['normal', 'urgent', 'critical'], default: 'normal' },
    startDate:  { type: Date, default: Date.now },
    endDate:    Date,
    diagnosis:  String,
    treatmentPlan: String,
    notes:      String
  },
  { timestamps: true }
);

// Only one active assignment per patient at a time
AssignmentSchema.index({ patient: 1, status: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);
