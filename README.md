# 🏥 MGM Hospital — Therapy Management System

A full-stack web application for managing therapy at MGM Hospital with **3 role-based dashboards** and **supervisor assignment** functionality.

---

## 🏗️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6, Recharts |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (JSON Web Tokens) + bcrypt      |

---

## 📁 Project Structure

```
mgm-hospital/
├── backend/
│   ├── server.js              ← Express app entry point
│   ├── .env.example           ← Copy to .env and fill in
│   ├── models/
│   │   ├── User.js            ← Patient / Therapist / Supervisor
│   │   ├── Assignment.js      ← Therapist ↔ Patient assignments
│   │   ├── Session.js         ← Therapy sessions
│   │   └── Mood.js            ← Patient mood logs
│   ├── routes/
│   │   ├── auth.js            ← Login, register, /me
│   │   ├── assignments.js     ← CRUD assignments (supervisor)
│   │   ├── patients.js        ← Patient list & detail
│   │   ├── therapists.js      ← Therapist list & detail
│   │   ├── sessions.js        ← Session scheduling & notes
│   │   ├── moods.js           ← Mood logging
│   │   └── dashboard.js       ← Role-specific stats
│   ├── middleware/
│   │   └── auth.js            ← JWT protect + role authorize
│   └── config/
│       └── seed.js            ← Seed demo data
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.jsx             ← Router + role-based routing
        ├── index.js
        ├── context/
        │   └── AuthContext.jsx ← Global auth state
        ├── services/
        │   └── api.js          ← All Axios API calls
        ├── components/
        │   └── Layout.jsx      ← Shared sidebar + nav
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── SupervisorDash.jsx
            ├── TherapistDash.jsx
            └── PatientDash.jsx
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

---

### 1. Clone & Setup Backend

```bash
cd mgm-hospital/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and set your MONGO_URI

# Seed the database with demo data
npm run seed

# Start the server
npm run dev
# → API running at http://localhost:5000
```

### 2. Setup Frontend

```bash
cd mgm-hospital/frontend

# Install dependencies
npm install

# Start React app
npm start
# → App running at http://localhost:3000
```

---

## 🔐 Demo Login Credentials

After running `npm run seed`:

| Role       | Email                          | Password     |
|------------|-------------------------------|--------------|
| Supervisor | supervisor@mgmhospital.in     | password123  |
| Therapist  | riya.mehta@mgmhospital.in     | password123  |
| Patient    | aarav.sharma@gmail.com        | password123  |

> The Login page also has **Quick Demo Login** buttons for each role.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Access  | Description         |
|--------|-----------------------|---------|---------------------|
| POST   | /api/auth/register    | Public  | Create account      |
| POST   | /api/auth/login       | Public  | Login, get JWT      |
| GET    | /api/auth/me          | Private | Get current user    |

### Assignments (Supervisor)
| Method | Endpoint                           | Description                  |
|--------|------------------------------------|------------------------------|
| GET    | /api/assignments                   | List all assignments         |
| GET    | /api/assignments/unassigned-patients | Patients without therapist |
| POST   | /api/assignments                   | Assign therapist to patient  |
| PUT    | /api/assignments/:id               | Update / transfer assignment |

### Sessions (Therapist)
| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | /api/sessions         | List sessions (role-filtered) |
| GET    | /api/sessions/today   | Today's sessions           |
| POST   | /api/sessions         | Schedule new session       |
| PUT    | /api/sessions/:id     | Add notes, update status   |

### Moods (Patient)
| Method | Endpoint    | Description         |
|--------|-------------|---------------------|
| POST   | /api/moods  | Log a mood entry    |
| GET    | /api/moods  | Get mood history    |

### Dashboard
| Method | Endpoint                   | Role       |
|--------|----------------------------|------------|
| GET    | /api/dashboard/supervisor  | Supervisor |
| GET    | /api/dashboard/therapist   | Therapist  |
| GET    | /api/dashboard/patient     | Patient    |

---

## 🎭 Features by Role

### 👨‍💼 Supervisor
- View all therapists with caseload bar chart
- See all patients (assigned & unassigned)
- **Assign therapist to patient** with priority, diagnosis, and notes
- Transfer or close assignments
- Reports and analytics dashboard

### 🧑‍⚕️ Therapist
- Overview with today's schedule and patient progress
- View assigned patients
- Full session history with status
- Add session notes with risk level assessment

### 🙋 Patient
- View assigned therapist details
- See upcoming sessions
- **Mood tracker** with score logging and line chart history
- Treatment progress overview

---

## 🔮 MGM Hospital API Integration

When MGM Hospital provides real API access, update `frontend/src/services/api.js`:

```javascript
// Replace base URL with MGM Hospital's API
const api = axios.create({
  baseURL: 'https://api.mgmhospital.in/v1',  // ← MGM Hospital endpoint
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.REACT_APP_MGM_API_KEY  // ← their API key
  }
});
```

You'll need to map MGM's response format to your existing data structure — the architecture is already modular for this.

---

## 🚀 Deploy to Production

**Backend** → Deploy to Railway, Render, or AWS EC2  
**Frontend** → Deploy to Vercel or Netlify  
**Database** → Use MongoDB Atlas (free tier available)

Set environment variables in your hosting platform matching `.env.example`.
