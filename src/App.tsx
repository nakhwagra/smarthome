import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboard Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Dashboard Pages
import Home from "./pages/dashboard/Home";
import Door from "./pages/dashboard/Door";
import DevicesPage from "./pages/dashboard/DevicesPage";
import Profile from "./pages/dashboard/Profile";
import AccessLogs from "./pages/AccessLogs";

// Admin Pages
import PendingUsers from "./pages/admin/PendingUsers";
import UserManagement from "./pages/admin/UserManagement";
import SensorsAnalytics from "./pages/admin/SensorsAnalytics";
import Settings from "./pages/admin/Settings";

// Protected Route Component
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Admin Route Component
function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="door" element={<Door />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="logs" element={<AccessLogs />} />

        {/* Admin Only Routes */}
        <Route path="sensors" element={
          <AdminRoute>
            <SensorsAnalytics />
          </AdminRoute>
        } />
        <Route path="admin/pending" element={
          <AdminRoute>
            <PendingUsers />
          </AdminRoute>
        } />
        <Route path="admin/users" element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } />
        <Route path="admin/settings" element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        } />
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
