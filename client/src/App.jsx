import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitLogbook from './pages/student/SubmitLogbook';
import WeeklyReportsPage from './pages/student/WeeklyReportsPage';
import FinalReportPage from './pages/student/FinalReportPage';
import InternshipContractPage from './pages/student/InternshipContractPage';
import { ToastProvider } from './components/ToastProvider';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import LecturerReviewLogbooks from './pages/lecturer/LecturerReviewLogbooks';
import LecturerReports from './pages/lecturer/LecturerReports';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManageClasses from './pages/admin/AdminManageClasses';
import AdminManageStudents from './pages/admin/AdminManageStudents';
import AdminReports from './pages/admin/AdminReports';

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
        <ToastProvider>
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
                <StudentDashboard />
              }
            />
            <Route
              path="logbook/submit"
              element={
                <SubmitLogbook />
              }
            />
            <Route
              path="weekly-reports"
              element={
                <WeeklyReportsPage />
              }
            />
            <Route
              path="documents-upload"
              element={
                <FinalReportPage />
              }
            />
            <Route path="report" element={<Navigate to="/student/documents-upload" replace />} />
            <Route
              path="internship-contract"
              element={
                <InternshipContractPage />
              }
            />
            <Route path="internship-contact" element={<Navigate to="/student/internship-contract" replace />} />
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
                element={<LecturerDashboard />}
            />
            <Route
              path="weekly-reports"
                element={<LecturerReviewLogbooks />}
            />
            <Route
              path="logbooks"
                element={<Navigate to="/lecturer/weekly-reports" replace />}
            />
            <Route
              path="reports"
                element={<LecturerReports />}
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
                element={<AdminDashboard />}
            />
            <Route
              path="classes"
                element={<AdminManageClasses />}
            />
            <Route
              path="students"
                element={<AdminManageStudents />}
            />
            <Route
              path="reports"
                element={<AdminReports />}
            />
            <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;