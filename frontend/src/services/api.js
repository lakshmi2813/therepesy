import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mgm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mgm_token');
      localStorage.removeItem('mgm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const login    = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe    = ()     => api.get('/auth/me');

// ── Dashboard ──
export const getSupervisorDashboard = () => api.get('/dashboard/supervisor');
export const getTherapistDashboard  = () => api.get('/dashboard/therapist');
export const getPatientDashboard    = () => api.get('/dashboard/patient');

// ── Assignments ──
export const getAssignments        = ()            => api.get('/assignments');
export const getUnassignedPatients = ()            => api.get('/assignments/unassigned-patients');
export const createAssignment      = (data)        => api.post('/assignments', data);
export const updateAssignment      = (id, data)    => api.put(`/assignments/${id}`, data);

// ── Patients & Therapists ──
export const getPatients     = ()   => api.get('/patients');
export const getTherapists   = ()   => api.get('/therapists');
export const getPatientById  = (id) => api.get(`/patients/${id}`);
export const getTherapistById= (id) => api.get(`/therapists/${id}`);

// ── Sessions ──
export const getSessions        = (params) => api.get('/sessions', { params });
export const getTodaySessions   = ()       => api.get('/sessions/today');
export const createSession      = (data)   => api.post('/sessions', data);
export const updateSession      = (id, d)  => api.put(`/sessions/${id}`, d);

// ── Moods ──
export const logMood  = (data) => api.post('/moods', data);
export const getMoods = ()     => api.get('/moods');

export default api;
