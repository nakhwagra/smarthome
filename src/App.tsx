// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth Pages
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";

// Dashboard Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Dashboard Pages
import Home from "./pages/dashboard/Home";
import Door from "./pages/dashboard/Door";
import DevicesPage from "./pages/dashboard/DevicesPage";
import Sensors from "./pages/Sensors.jsx";
import History from "./pages/History.jsx";

// Admin Pages
import PendingUsers from "./pages/admin/PendingUsers";
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
        <Route path="sensors" element={<Sensors />} />
        <Route path="logs" element={<History />} />
        
        {/* Admin Only Routes */}
        <Route path="admin/pending" element={
          <AdminRoute>
            <PendingUsers />
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
