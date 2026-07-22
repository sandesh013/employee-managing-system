import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import EmployeesPage from './pages/EmployeesPage.jsx'
import DepartmentsPage from './pages/DepartmentsPage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import LeavesPage from './pages/LeavesPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import PayrollPage from './pages/PayrollPage.jsx'
import PerformancePage from './pages/PerformancePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected routes — every logged-in role can reach these; the layout
          renders a role-aware sidebar and each page adapts its own content. */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Role-restricted routes */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute roles={['admin', 'hr', 'manager']}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute roles={['admin']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute roles={['admin', 'hr', 'employee']}>
              <PayrollPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
