var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/dashboard/Door.tsx
import { useEffect, useState } from "react";
import { Lock, Unlock, RotateCcw, AlertCircle, Check } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import { useTheme } from "../../context/ThemeContext";
export default function Door() {
    const [doorStatus, setDoorStatus] = useState("closed");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const { isDark } = useTheme();
    useEffect(() => {
        fetchDoorStatus();
        fetchAccessLogs();
        // WebSocket listener untuk door status
        const handleDoorStatus = (data) => {
            setDoorStatus(data.status);
        };
        const handleAccessLog = (data) => {
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
    const fetchDoorStatus = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axiosClient.get("/device/door/latest");
            if (res.data.success && res.data.data) {
                setDoorStatus(res.data.data.status);
            }
        }
        catch (err) {
            console.error("Failed to fetch door status:", err);
        }
    });
    const fetchAccessLogs = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axiosClient.get("/access-log?limit=10");
            if (res.data.success && res.data.data) {
                setLogs(res.data.data);
            }
        }
        catch (err) {
            console.error("Failed to fetch access logs:", err);
        }
    });
    const handleDoorControl = (action) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        setLoading(true);
        try {
            // Map frontend actions to backend actions
            const backendAction = action === "open" ? "unlock" : "lock";
            yield axiosClient.post("/control/door", { action: backendAction });
        }
        catch (err) {
            const axiosErr = err;
            alert(((_b = (_a = axiosErr === null || axiosErr === void 0 ? void 0 : axiosErr.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Gagal mengontrol pintu");
        }
        finally {
            setLoading(false);
        }
    });
    const isOpen = doorStatus === "open";
    return (_jsxs("div", { className: `min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`, children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: `text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`, children: "Kontrol Pintu" }), _jsx("p", { className: `mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Buka/tutup pintu dan lihat riwayat akses" })] }), _jsxs("div", { className: `mb-6 rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: `text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`, children: "Status Pintu" }), _jsx("p", { className: `text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Keadaan pintu saat ini" })] }), _jsxs("div", { className: `flex items-center gap-2 px-4 py-2 rounded-lg ${isOpen
                                    ? "bg-green-100 dark:bg-green-900/30"
                                    : "bg-orange-100 dark:bg-orange-900/30"}`, children: [isOpen ? (_jsx(Unlock, { className: "w-5 h-5 text-green-600 dark:text-green-400" })) : (_jsx(Lock, { className: "w-5 h-5 text-orange-600 dark:text-orange-400" })), _jsx("span", { className: `font-semibold text-sm ${isOpen
                                            ? "text-green-700 dark:text-green-300"
                                            : "text-orange-700 dark:text-orange-300"}`, children: isOpen ? "Terbuka" : "Tertutup" })] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("button", { onClick: () => handleDoorControl("open"), disabled: loading || isOpen, className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${loading || isOpen
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"}`, children: [_jsx(Unlock, { className: "w-5 h-5" }), "Buka Pintu"] }), _jsxs("button", { onClick: () => handleDoorControl("close"), disabled: loading || !isOpen, className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${loading || !isOpen
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"}`, children: [_jsx(Lock, { className: "w-5 h-5" }), "Tutup Pintu"] })] })] }), _jsxs("div", { className: `rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: `text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`, children: "Riwayat Akses" }), _jsx("p", { className: `text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Catatan 10 akses terakhir" })] }), _jsxs("button", { onClick: fetchAccessLogs, className: `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${isDark
                                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`, children: [_jsx(RotateCcw, { className: "w-4 h-4" }), "Refresh"] })] }), logs.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx(AlertCircle, { className: `w-12 h-12 mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}` }), _jsx("p", { className: `text-center ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Belum ada riwayat akses" })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: `border-b ${isDark ? "border-slate-700" : "border-slate-200"}`, children: [_jsx("th", { className: `text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`, children: "Waktu" }), _jsx("th", { className: `text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`, children: "Metode" }), _jsx("th", { className: `text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`, children: "User" }), _jsx("th", { className: `text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`, children: "Status" })] }) }), _jsx("tbody", { children: logs.map(log => (_jsxs("tr", { className: `border-b transition-colors ${isDark
                                            ? "border-slate-700 hover:bg-slate-700/50"
                                            : "border-slate-100 hover:bg-slate-50"}`, children: [_jsx("td", { className: `py-3 px-4 text-sm ${isDark ? "text-slate-300" : "text-slate-900"}`, children: new Date(log.timestamp).toLocaleString("id-ID") }), _jsx("td", { className: `py-3 px-4 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-900"}`, children: log.method }), _jsx("td", { className: `py-3 px-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`, children: log.user_name || "-" }), _jsx("td", { className: "py-3 px-4 text-sm", children: _jsxs("span", { className: `inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${log.status === "success"
                                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`, children: [log.status === "success" && _jsx(Check, { className: "w-4 h-4" }), log.status === "success" ? "Berhasil" : "Gagal"] }) })] }, log.id))) })] }) }))] })] }));
}
