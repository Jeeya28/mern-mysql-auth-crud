import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import Dashboard from './components/Dashboard';
import ProfileSettings from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />

      <Route path="/forgot-password" element={
        <PublicRoute><ForgotPassword /></PublicRoute>
      } />

      <Route path="/verify-email/:token" element={
        <PublicRoute><VerifyEmail /></PublicRoute>
      } />

      <Route path="/reset-password/:token" element={
        <PublicRoute><ResetPassword /></PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      {/* Profile Settings — protected */}
      <Route path="/profile" element={
        <ProtectedRoute><ProfileSettings /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;