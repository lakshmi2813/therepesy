import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import SupervisorDash from './pages/SupervisorDash';
import TherapistDash  from './pages/TherapistDash';
import PatientDash    from './pages/PatientDash';

const RoleRoute = ({ role, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to={`/${user.role}`} />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/supervisor" element={<RoleRoute role="supervisor"><SupervisorDash /></RoleRoute>} />
      <Route path="/therapist"  element={<RoleRoute role="therapist"><TherapistDash /></RoleRoute>} />
      <Route path="/patient"    element={<RoleRoute role="patient"><PatientDash /></RoleRoute>} />
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
