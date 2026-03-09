import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import PlaceholderPage from './pages/PlaceholderPage';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl text-usiu-red font-bold">403 - Unauthorized</h1>
      <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
      <button 
        onClick={() => window.history.back()}
        className="mt-4 px-4 py-2 bg-usiu-navy text-white rounded hover:bg-opacity-90"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    // ✅ Router MUST wrap AuthProvider since AuthProvider uses useNavigate()
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="dashboard"
              element={
                <PlaceholderPage
                  title="Student Dashboard"
                  description="Overview of your internship progress and recent activity."
                />
              }
            />
            <Route
              path="logbook/submit"
              element={
                <PlaceholderPage
                  title="Submit Logbook"
                  description="Create and submit your weekly internship logbook entry."
                />
              }
            />
            <Route
              path="report"
              element={
                <PlaceholderPage
                  title="Final Report"
                  description="Upload and manage your final internship report."
                />
              }
            />
            <Route
              path="feedback"
              element={
                <PlaceholderPage
                  title="View Feedback"
                  description="Read lecturer feedback on your logbook entries and report."
                />
              }
            />
            <Route path="" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          {/* Lecturer routes */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="dashboard"
              element={
                <PlaceholderPage
                  title="Lecturer Dashboard"
                  description="Monitor student progress across your assigned classes."
                />
              }
            />
            <Route
              path="classes"
              element={
                <PlaceholderPage
                  title="My Classes"
                  description="View classes you supervise and enrolled students."
                />
              }
            />
            <Route
              path="logbooks"
              element={
                <PlaceholderPage
                  title="Review Logbooks"
                  description="Review, approve, or reject student logbook submissions."
                />
              }
            />
            <Route
              path="reports"
              element={
                <PlaceholderPage
                  title="Reports"
                  description="View internship summary and reporting insights for your classes."
                />
              }
            />
            <Route path="" element={<Navigate to="/lecturer/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/lecturer/dashboard" replace />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="dashboard"
              element={
                <PlaceholderPage
                  title="Admin Dashboard"
                  description="System overview and internship progress across the university."
                />
              }
            />
            <Route
              path="classes"
              element={
                <PlaceholderPage
                  title="Manage Classes"
                  description="Create classes and assign lecturers."
                />
              }
            />
            <Route
              path="students"
              element={
                <PlaceholderPage
                  title="Manage Students"
                  description="Enroll students into classes and manage access."
                />
              }
            />
            <Route
              path="reports"
              element={
                <PlaceholderPage
                  title="Reports"
                  description="Generate and view internship progress reports."
                />
              }
            />
            <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;