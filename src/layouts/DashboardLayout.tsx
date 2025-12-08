// src/layouts/DashboardLayout.tsx
import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import websocketService from "../services/websocketService";
import "../styles/dashboard.css";

export default function DashboardLayout(): JSX.Element {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        // Connect WebSocket saat masuk dashboard
        websocketService.connect();

        return () => {
            // Disconnect saat keluar dari dashboard
            websocketService.disconnect();
        };
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isAdmin = user?.role === "admin";

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>🏠 Smart Home</h2>
                    <p className="user-info">
                        {user?.name || user?.email}
                        <span className={`role-badge ${user?.role}`}>
                            {user?.role}
                        </span>
                    </p>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <p className="nav-section-title">MENU</p>
                        <NavLink to="/dashboard" end className="nav-link">
                            <span className="nav-icon">🏠</span>
                            Home
                        </NavLink>
                        <NavLink to="/dashboard/door" className="nav-link">
                            <span className="nav-icon">🚪</span>
                            Pintu
                        </NavLink>
                        <NavLink to="/dashboard/devices" className="nav-link">
                            <span className="nav-icon">💡</span>
                            Perangkat
                        </NavLink>
                        <NavLink to="/dashboard/sensors" className="nav-link">
                            <span className="nav-icon">📊</span>
                            Sensor
                        </NavLink>
                        <NavLink to="/dashboard/logs" className="nav-link">
                            <span className="nav-icon">📝</span>
                            Riwayat
                        </NavLink>
                    </div>

                    {isAdmin && (
                        <div className="nav-section">
                            <p className="nav-section-title">ADMIN</p>
                            <NavLink to="/dashboard/admin/pending" className="nav-link">
                                <span className="nav-icon">⏳</span>
                                Pending Users
                            </NavLink>
                            <NavLink to="/dashboard/admin/users" className="nav-link">
                                <span className="nav-icon">👥</span>
                                Kelola User
                            </NavLink>
                            <NavLink to="/dashboard/admin/settings" className="nav-link">
                                <span className="nav-icon">⚙️</span>
                                Pengaturan
                            </NavLink>
                        </div>
                    )}

                    <div className="nav-section">
                        <p className="nav-section-title">AKUN</p>
                        <NavLink to="/dashboard/profile" className="nav-link">
                            <span className="nav-icon">👤</span>
                            Profile
                        </NavLink>
                        <button onClick={handleLogout} className="nav-link logout-btn">
                            <span className="nav-icon">🚪</span>
                            Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
}
