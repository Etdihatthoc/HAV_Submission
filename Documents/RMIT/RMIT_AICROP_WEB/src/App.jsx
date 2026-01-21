/**
 * Main App Component with Routing
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AnimalDiagnosis from './pages/AnimalDiagnosis';
import Market from './pages/Market';
import { CreditsProvider } from './contexts/CreditsContext';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import History from './pages/History';
import EpidemicMap from './pages/EpidemicMap';
import DiagnosisResult from './pages/DiagnosisResult';
import ExpertChat from './pages/ExpertChat';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TransactionHistory from './pages/TransactionHistory';
import CropUpdate from './pages/CropUpdate';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/crop-update" element={<ProtectedRoute><CropUpdate /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><EpidemicMap /></ProtectedRoute>} />
      <Route path="/result/:id" element={<ProtectedRoute><DiagnosisResult /></ProtectedRoute>} />
      <Route path="/expert/:diagnosisId" element={<ProtectedRoute><ExpertChat /></ProtectedRoute>} />
      <Route path="/expert" element={<ProtectedRoute><ExpertChat /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
      <Route path="/animal-diagnosis" element={<ProtectedRoute><AnimalDiagnosis /></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CreditsProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CreditsProvider>
    </AuthProvider>
  );
}

export default App;

