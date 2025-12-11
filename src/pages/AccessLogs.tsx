// src/pages/AccessLogs.tsx
import React, { useEffect, useState } from "react";
import { Shield, Clock, CheckCircle, XCircle, User, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import accessLogApi, { AccessLog } from "../api/accessLogApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function AccessLogs(): JSX.Element {
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { user } = useAuth();
    const { isDark } = useTheme();

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [statusFilter, logs]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filter changes
    }, [statusFilter, itemsPerPage]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let response;
            
            if (isAdmin) {
                // Admin: Get all logs
                response = await accessLogApi.getAll();
            } else {
                // User: Get only their logs
                const userId = user?.user_id || user?.id;
                if (!userId) {
                    console.error("User ID not found");
                    return;
                }
                response = await accessLogApi.getByUser(userId);
            }

            if (response.data.success && response.data.data) {
                setLogs(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        if (statusFilter === "all") {
            setFilteredLogs(logs);
        } else {
            setFilteredLogs(logs.filter(log => log.status === statusFilter));
        }
    };

    const getMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            face: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
            pin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
            remote: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        };
        return colors[method] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>Loading logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Access Logs
                        </h1>
                        <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {isAdmin ? "All system access logs" : "Your access history"}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${isAdmin ? "bg-purple-100 dark:bg-purple-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                        <div className="flex items-center gap-2">
                            <Shield className={`w-5 h-5 ${isAdmin ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"}`} />
                            <span className={`font-medium ${isAdmin ? "text-purple-700 dark:text-purple-300" : "text-blue-700 dark:text-blue-300"}`}>
                                {isAdmin ? "Admin View" : "User View"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className={`mb-6 p-4 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        <Filter className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    statusFilter === "all"
                                        ? "bg-indigo-600 text-white"
                                        : isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                All ({logs.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter("success")}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    statusFilter === "success"
                                        ? "bg-green-600 text-white"
                                        : isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                Success ({logs.filter(l => l.status === "success").length})
                            </button>
                            <button
                                onClick={() => setStatusFilter("failed")}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    statusFilter === "failed"
                                        ? "bg-red-600 text-white"
                                        : isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                Failed ({logs.filter(l => l.status === "failed").length})
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            Show:
                        </label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className={`px-3 py-2 rounded-lg border ${
                                isDark
                                    ? "bg-slate-700 border-slate-600 text-slate-200"
                                    : "bg-white border-slate-300 text-slate-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? "bg-slate-700/50" : "bg-slate-50"}>
                            <tr>
                                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Time
                                </th>
                                {isAdmin && (
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        User
                                    </th>
                                )}
                                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Method
                                </th>
                                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {currentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center">
                                        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                                            No logs found
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                currentLogs.map((log) => (
                                    <tr key={log.access_id} className={isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50"}>
                                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">{formatDate(log.timestamp)}</span>
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm">
                                                        {log.user_id ? `User #${log.user_id}` : "System"}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodBadge(log.method)}`}>
                                                {log.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {log.status === "success" ? (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                            Success
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                                            Failed
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {filteredLogs.length > 0 && (
                    <div className={`px-6 py-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        <div className="flex items-center justify-between">
                            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${
                                        currentPage === 1
                                            ? isDark
                                                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : isDark
                                            ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className={`px-4 py-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-colors ${
                                        currentPage === totalPages
                                            ? isDark
                                                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : isDark
                                            ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
                <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                    <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Total Access
                    </p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {logs.length}
                    </p>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"}`}>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Success
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {logs.filter(l => l.status === "success").length}
                    </p>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"}`}>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Failed
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {logs.filter(l => l.status === "failed").length}
                    </p>
                </div>
            </div>
        </div>
    );
}
