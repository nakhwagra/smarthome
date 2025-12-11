import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
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
function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : _jsx(Navigate, { to: "/login" });
}
// Admin Route Component
function AdminRoute({ children }) {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login" });
    }
    if ((user === null || user === void 0 ? void 0 : user.role) !== "admin") {
        return _jsx(Navigate, { to: "/dashboard" });
    }
    return children;
}
function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsxs(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Home, {}) }), _jsx(Route, { path: "door", element: _jsx(Door, {}) }), _jsx(Route, { path: "devices", element: _jsx(DevicesPage, {}) }), _jsx(Route, { path: "sensors", element: _jsx(Sensors, {}) }), _jsx(Route, { path: "logs", element: _jsx(History, {}) }), _jsx(Route, { path: "admin/pending", element: _jsx(AdminRoute, { children: _jsx(PendingUsers, {}) }) }), _jsx(Route, { path: "admin/settings", element: _jsx(AdminRoute, { children: _jsx(Settings, {}) }) })] }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard" }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard" }) })] }));
}
export default App;
