const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Session = require('../models/Session');
const Mood = require('../models/Mood');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mgm_hospital';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('🔗 Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Assignment.deleteMany(), Session.deleteMany(), Mood.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  const hash = (pw) => bcrypt.hash(pw, 12);

  // ── SUPERVISOR ──
  const supervisor = await User.create({
    name: 'Dr. S. Malhotra',
    email: 'supervisor@mgmhospital.in',
    password: await hash('password123'),
    role: 'supervisor',
    department: 'Mental Health Division',
    supervisorLevel: 'Head of Department'
  });

  // ── THERAPISTS ──
  const therapistData = [
    { name: 'Dr. Riya Mehta',    email: 'riya.mehta@mgmhospital.in',    specializations: ['CBT','Anxiety','Depression'],   extension: '2045', department: 'OPD Block' },
    { name: 'Dr. Arjun Kapoor',  email: 'arjun.kapoor@mgmhospital.in',  specializations: ['Trauma','PTSD','EMDR'],         extension: '2046', department: 'IPD Block' },
    { name: 'Dr. Fatima Sheikh', email: 'fatima.sheikh@mgmhospital.in', specializations: ['DBT','BPD','Group Therapy'],    extension: '2047', department: 'OPD Block' },
    { name: 'Dr. Vimal Singh',   email: 'vimal.singh@mgmhospital.in',   specializations: ['OCD','CBT','ERP'],              extension: '2048', department: 'OPD Block' },
    { name: 'Dr. Lakshmi Iyer',  email: 'lakshmi.iyer@mgmhospital.in', specializations: ['Child Therapy','Play Therapy'], extension: '2049', department: 'Pediatrics' },
  ];

  const therapists = await Promise.all(
    therapistData.map(t => User.create({ ...t, password: 'password123', role: 'therapist' }))
  );

  // ── PATIENTS ──
  const patientData = [
    { name: 'Aarav Sharma',    email: 'aarav.sharma@gmail.com',   gender: 'Male',   dateOfBirth: new Date('1997-03-14'), phone: '9876543210' },
    { name: 'Priya Nair',      email: 'priya.nair@gmail.com',     gender: 'Female', dateOfBirth: new Date('1991-07-22'), phone: '9876543211' },
    { name: 'Karan Patel',     email: 'karan.patel@gmail.com',    gender: 'Male',   dateOfBirth: new Date('2003-11-05'), phone: '9876543212' },
    { name: 'Sunita Rao',      email: 'sunita.rao@gmail.com',     gender: 'Female', dateOfBirth: new Date('1980-02-18'), phone: '9876543213' },
    { name: 'Rajan Iyer',      email: 'rajan.iyer@gmail.com',     gender: 'Male',   dateOfBirth: new Date('1970-09-01'), phone: '9876543214' },
    { name: 'Meena Das',       email: 'meena.das@gmail.com',      gender: 'Female', dateOfBirth: new Date('1994-05-30'), phone: '9876543215' },
    { name: 'Meera Joshi',     email: 'meera.joshi@gmail.com',    gender: 'Female', dateOfBirth: new Date('1999-01-12'), phone: '9876543216' },
    { name: 'Rohan Kulkarni',  email: 'rohan.k@gmail.com',        gender: 'Male',   dateOfBirth: new Date('1988-06-25'), phone: '9876543217' },
  ];

  const patients = await Promise.all(
    patientData.map(p => User.create({ ...p, password: 'password123', role: 'patient' }))
  );

  // ── ASSIGNMENTS ──
  const assignments = await Promise.all([
    Assignment.create({ patient: patients[0]._id, therapist: therapists[0]._id, supervisor: supervisor._id, diagnosis: 'Major Depressive Disorder', priority: 'normal', status: 'active' }),
    Assignment.create({ patient: patients[1]._id, therapist: therapists[0]._id, supervisor: supervisor._id, diagnosis: 'Generalized Anxiety Disorder', priority: 'normal', status: 'active' }),
    Assignment.create({ patient: patients[2]._id, therapist: therapists[1]._id, supervisor: supervisor._id, diagnosis: 'PTSD', priority: 'urgent', status: 'active' }),
    Assignment.create({ patient: patients[3]._id, therapist: therapists[2]._id, supervisor: supervisor._id, diagnosis: 'Borderline Personality Disorder', priority: 'normal', status: 'active' }),
    Assignment.create({ patient: patients[4]._id, therapist: therapists[3]._id, supervisor: supervisor._id, diagnosis: 'OCD', priority: 'normal', status: 'active' }),
    Assignment.create({ patient: patients[5]._id, therapist: therapists[0]._id, supervisor: supervisor._id, diagnosis: 'Depression', priority: 'normal', status: 'active' }),
    // patients[6] and [7] are unassigned
  ]);

  // ── SESSIONS ──
  const now = new Date();
  const day = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  await Session.insertMany([
    { patient: patients[0]._id, therapist: therapists[0]._id, date: day(-7), status: 'completed', type: 'individual', therapy: 'CBT', module: 'Module 1', duration: 50, notes: { summary: 'Initial assessment, mood low', nextSteps: 'Daily journaling', riskLevel: 'low' }, rating: 5 },
    { patient: patients[0]._id, therapist: therapists[0]._id, date: day(-3), status: 'completed', type: 'individual', therapy: 'CBT', module: 'Module 2', duration: 50, notes: { summary: 'Improved mood, thought records', nextSteps: 'Practice ABC model', riskLevel: 'low' }, rating: 5 },
    { patient: patients[0]._id, therapist: therapists[0]._id, date: day(2),  status: 'scheduled', type: 'individual', therapy: 'CBT', module: 'Module 3', duration: 50, location: 'Room 204 OPD' },
    { patient: patients[1]._id, therapist: therapists[0]._id, date: day(-5), status: 'completed', type: 'individual', therapy: 'CBT', duration: 50, notes: { summary: 'High anxiety, breathing exercises', riskLevel: 'medium' }, rating: 4 },
    { patient: patients[1]._id, therapist: therapists[0]._id, date: day(1),  status: 'scheduled', type: 'individual', therapy: 'CBT', duration: 50, location: 'Room 204 OPD' },
    { patient: patients[2]._id, therapist: therapists[1]._id, date: day(-2), status: 'completed', type: 'individual', therapy: 'EMDR', duration: 60, notes: { summary: 'Processing trauma memory', riskLevel: 'high' }, rating: 4 },
    { patient: patients[3]._id, therapist: therapists[2]._id, date: day(-1), status: 'completed', type: 'group', therapy: 'DBT', duration: 90, notes: { summary: 'Group session, good participation', riskLevel: 'low' }, rating: 5 },
  ]);

  // ── MOODS ──
  await Mood.insertMany([
    { patient: patients[0]._id, mood: 'Calm', score: 7, emoji: '😌', note: 'Had a good morning', createdAt: day(-6) },
    { patient: patients[0]._id, mood: 'Anxious', score: 4, emoji: '😟', note: 'Work stress', createdAt: day(-5) },
    { patient: patients[0]._id, mood: 'Happy', score: 8, emoji: '😊', note: 'Session helped a lot', createdAt: day(-3) },
    { patient: patients[0]._id, mood: 'Motivated', score: 9, emoji: '🔥', note: 'Completed homework', createdAt: day(-1) },
  ]);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('── LOGIN CREDENTIALS ──────────────────────');
  console.log('🔵 Supervisor:  supervisor@mgmhospital.in / password123');
  console.log('🟢 Therapist:   riya.mehta@mgmhospital.in / password123');
  console.log('🟣 Patient:     aarav.sharma@gmail.com / password123');
  console.log('────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
