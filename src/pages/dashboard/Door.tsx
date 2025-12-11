// src/pages/dashboard/Door.tsx
import React, { useEffect, useState } from "react";
import { Lock, Unlock, RotateCcw, AlertCircle, Check } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import { useTheme } from "../../context/ThemeContext";

interface AccessLog {
    id: number;
    method: string;
    status: string;
    timestamp: string;
    user_name?: string;
}

export default function Door(): JSX.Element {
    const [doorStatus, setDoorStatus] = useState<string>("closed");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const { isDark } = useTheme();

    useEffect(() => {
        fetchDoorStatus();
        fetchAccessLogs();

        // WebSocket listener untuk door status
        const handleDoorStatus = (data: { status: string }) => {
            setDoorStatus(data.status);
        };

        const handleAccessLog = (data: AccessLog) => {
            // Tambah log baru ke list
            setLogs(prev => [data, ...prev].slice(0, 10));
        };

        websocketService.on(WS_TYPES.DOOR_STATUS, handleDoorStatus);
        websocketService.on(WS_TYPES.ACCESS_LOG, handleAccessLog);

        return () => {
            websocketService.off(WS_TYPES.DOOR_STATUS, handleDoorStatus);
            websocketService.off(WS_TYPES.ACCESS_LOG, handleAccessLog);
        };
    }, []);

    const fetchDoorStatus = async () => {
        try {
            const res = await axiosClient.get("/device/door/latest");
            if (res.data.success && res.data.data) {
                setDoorStatus(res.data.data.status);
            }
        } catch (err) {
            console.error("Failed to fetch door status:", err);
        }
    };

    const fetchAccessLogs = async () => {
        try {
            const res = await axiosClient.get("/access-log?limit=10");
            if (res.data.success && res.data.data) {
                setLogs(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch access logs:", err);
        }
    };

    const handleDoorControl = async (action: "open" | "close") => {
        setLoading(true);
        try {
            // Map frontend actions to backend actions
            const backendAction = action === "open" ? "unlock" : "lock";
            await axiosClient.post("/control/door", { action: backendAction });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr?.response?.data?.message || "Gagal mengontrol pintu");
        } finally {
            setLoading(false);
        }
    };

    const isOpen = doorStatus === "open";

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Kontrol Pintu
                </h1>
                <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Buka/tutup pintu dan lihat riwayat akses
                </p>
            </div>

            {/* Door Status Card */}
            <div className={`mb-6 rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Status Pintu
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Keadaan pintu saat ini
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        isOpen 
                            ? "bg-green-100 dark:bg-green-900/30" 
                            : "bg-orange-100 dark:bg-orange-900/30"
                    }`}>
                        {isOpen ? (
                            <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        )}
                        <span className={`font-semibold text-sm ${
                            isOpen
                                ? "text-green-700 dark:text-green-300"
                                : "text-orange-700 dark:text-orange-300"
                        }`}>
                            {isOpen ? "Terbuka" : "Tertutup"}
                        </span>
                    </div>
                </div>

                {/* Door Control Buttons */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => handleDoorControl("open")}
                        disabled={loading || isOpen}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                            loading || isOpen
                                ? isDark
                                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                        }`}
                    >
                        <Unlock className="w-5 h-5" />
                        Buka Pintu
                    </button>
                    <button 
                        onClick={() => handleDoorControl("close")}
                        disabled={loading || !isOpen}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                            loading || !isOpen
                                ? isDark
                                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                        }`}
                    >
                        <Lock className="w-5 h-5" />
                        Tutup Pintu
                    </button>
                </div>
            </div>

            {/* Access Logs Card */}
            <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Riwayat Akses
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Catatan 10 akses terakhir
                        </p>
                    </div>
                    <button 
                        onClick={fetchAccessLogs}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                            isDark
                                ? "bg-slate-700 hover:bg-slate-600 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                        }`}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className={`w-12 h-12 mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                        <p className={`text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Belum ada riwayat akses
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Waktu
                                    </th>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Metode
                                    </th>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        User
                                    </th>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr 
                                        key={log.id} 
                                        className={`border-b transition-colors ${
                                            isDark
                                                ? "border-slate-700 hover:bg-slate-700/50"
                                                : "border-slate-100 hover:bg-slate-50"
                                        }`}
                                    >
                                        <td className={`py-3 px-4 text-sm ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                                            {new Date(log.timestamp).toLocaleString("id-ID")}
                                        </td>
                                        <td className={`py-3 px-4 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                                            {log.method}
                                        </td>
                                        <td className={`py-3 px-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                            {log.user_name || "-"}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                                                log.status === "success"
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                            }`}>
                                                {log.status === "success" && <Check className="w-4 h-4" />}
                                                {log.status === "success" ? "Berhasil" : "Gagal"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
