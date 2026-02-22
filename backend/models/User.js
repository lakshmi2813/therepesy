const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role:     { type: String, enum: ['patient', 'therapist', 'supervisor'], required: true },
    avatar:   { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // For therapists
    specializations: [String],
    licenseNumber:   String,
    department:      String,
    extension:       String,
    // For patients
    dateOfBirth:  Date,
    gender:       String,
    bloodGroup:   String,
    phone:        String,
    address:      String,
    emergencyContact: {
      name:         String,
      relationship: String,
      phone:        String
    },
    // Supervisor only
    supervisorLevel: String
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Virtual: age from DOB
UserSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  return Math.floor((Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

module.exports = mongoose.model('User', UserSchema);
