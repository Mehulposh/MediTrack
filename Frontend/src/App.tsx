import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../src/store/authstore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patients/Dashboard';
import DoctorDashboard from './pages/doctors/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Unauthorized page
const Unauthorized = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">403 - Unauthorized</h1>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
        Go to Login
      </a>
    </div>
  </div>
);

function App() {
  const { initializeAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect based on role if already authenticated
  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return '/login';
    
    switch (user.role) {
      case 'patient':
        return '/patient';
      case 'doctor':
        return '/doctor';
      case 'admin':
        return '/admin';
      default:
        return '/login';
    }
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Patient Routes */}
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Doctor Routes */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <a href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;