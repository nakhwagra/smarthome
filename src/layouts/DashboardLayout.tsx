// src/layouts/DashboardLayout.tsx
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import websocketService from "../services/websocketService";
import { Menu, X, Sun, Moon, LogOut, Home, Lock, Lightbulb, BarChart3, FileText, Users, Settings } from "lucide-react";

export default function DashboardLayout(): JSX.Element {
    const { user: ctxUser, logout, isAuthenticated } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Fallback to localStorage if context user incomplete
    const user = ctxUser || (() => {
        try {
            const stored = localStorage.getItem("auth_user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        websocketService.connect();

        return () => {
            websocketService.disconnect();
        };
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isAdmin = user?.role === "admin";

    const menuItems = [
        { path: "/dashboard", label: "Home", icon: Home },
        { path: "/dashboard/door", label: "Door", icon: Lock },
        { path: "/dashboard/devices", label: "Devices", icon: Lightbulb },
        { path: "/dashboard/sensors", label: "Sensors", icon: BarChart3 },
        { path: "/dashboard/logs", label: "Logs", icon: FileText },
    ];

    const adminItems = [
        { path: "/dashboard/admin/pending", label: "Pending Users", icon: Users },
        { path: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
            <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-y-auto`}>
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
                        {sidebarOpen && <h1 className="text-xl font-bold text-slate-900 dark:text-white">🏠 SmartHome</h1>}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* User Info */}
                    {sidebarOpen && (
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{user?.name || "User"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                            <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                isAdmin ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            }`}>
                                {user?.role || "Member"}
                            </span>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="p-3 space-y-1">
                        {menuItems.map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/dashboard"}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                                    ${isActive
                                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    }
                                `}
                            >
                                <item.icon size={20} className="flex-shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Admin Section */}
                    {isAdmin && sidebarOpen && (
                        <>
                            <div className="px-3 py-2">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Admin</h3>
                            </div>
                            <nav className="p-3 space-y-1">
                                {adminItems.map(item => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                                            ${isActive
                                                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            }
                                        `}
                                    >
                                        <item.icon size={20} className="flex-shrink-0" />
                                        {sidebarOpen && <span>{item.label}</span>}
                                    </NavLink>
                                ))}
                            </nav>
                        </>
                    )}

                    {/* Logout */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm ${!sidebarOpen && "justify-center"}`}
                        >
                            <LogOut size={20} />
                            {sidebarOpen && <span>Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Header */}
                    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {location.pathname.includes("pending") && "Pending Users"}
                                {location.pathname.includes("settings") && "Settings"}
                                {location.pathname.includes("door") && "Door Control"}
                                {location.pathname.includes("devices") && "Devices"}
                                {location.pathname.includes("sensors") && "Sensors"}
                                {location.pathname.includes("logs") && "Activity Logs"}
                                {location.pathname === "/dashboard" && "Dashboard"}
                            </h2>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title={isDark ? "Light Mode" : "Dark Mode"}
                        >
                            {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-700" />}
                        </button>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto">
                        <div className="p-6">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
