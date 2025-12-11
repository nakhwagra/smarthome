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
// src/pages/dashboard/DevicesPage.tsx
import { useEffect, useState } from "react";
import { Lightbulb, Wind, Power } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import { useTheme } from "../../context/ThemeContext";
export default function DevicesPage() {
    const [devices, setDevices] = useState({
        lamp: "off",
        curtain: "closed",
    });
    const [modes, setModes] = useState({
        lamp: "manual",
        curtain: "manual",
    });
    const [loading, setLoading] = useState({});
    const { isDark } = useTheme();
    useEffect(() => {
        fetchDeviceStatus();
        // WebSocket listeners
        const handleLampStatus = (data) => {
            setDevices(prev => (Object.assign(Object.assign({}, prev), { lamp: data.status })));
        };
        const handleCurtainStatus = (data) => {
            setDevices(prev => (Object.assign(Object.assign({}, prev), { curtain: data.status })));
        };
        websocketService.on(WS_TYPES.LAMP_STATUS, handleLampStatus);
        websocketService.on(WS_TYPES.CURTAIN_STATUS, handleCurtainStatus);
        return () => {
            websocketService.off(WS_TYPES.LAMP_STATUS, handleLampStatus);
            websocketService.off(WS_TYPES.CURTAIN_STATUS, handleCurtainStatus);
        };
    }, []);
    const fetchDeviceStatus = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const [lampRes, curtainRes] = yield Promise.all([
                axiosClient.get("/device/lamp/latest").catch(() => ({ data: { success: false, data: null } })),
                axiosClient.get("/device/curtain/latest").catch(() => ({ data: { success: false, data: null } })),
            ]);
            if (lampRes.data.success && lampRes.data.data) {
                setDevices(prev => (Object.assign(Object.assign({}, prev), { lamp: lampRes.data.data.status })));
            }
            if (curtainRes.data.success && curtainRes.data.data) {
                setDevices(prev => (Object.assign(Object.assign({}, prev), { curtain: curtainRes.data.data.status })));
            }
        }
        catch (err) {
            console.error("Failed to fetch device status:", err);
        }
    });
    const handleDeviceControl = (device, action, position) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        setLoading(prev => (Object.assign(Object.assign({}, prev), { [device]: true })));
        try {
            const mode = modes[device];
            const payload = Object.assign({ action, mode }, (device === "curtain" && position !== undefined ? { position } : {}));
            yield axiosClient.post(`/control/${device}`, payload);
        }
        catch (err) {
            const axiosErr = err;
            alert(((_b = (_a = axiosErr === null || axiosErr === void 0 ? void 0 : axiosErr.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || `Gagal mengontrol ${device}`);
        }
        finally {
            setLoading(prev => (Object.assign(Object.assign({}, prev), { [device]: false })));
        }
    });
    const toggleMode = (device) => {
        setModes(prev => (Object.assign(Object.assign({}, prev), { [device]: prev[device] === "manual" ? "auto" : "manual" })));
    };
    const isLampOn = devices.lamp === "on";
    const isCurtainOpen = devices.curtain === "open";
    return (_jsxs("div", { className: `min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`, children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: `text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`, children: "Kontrol Perangkat" }), _jsx("p", { className: `mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Kontrol lampu, gorden, dan perangkat lainnya" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: `rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`, children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("div", { className: `p-3 rounded-xl ${isDark ? "bg-yellow-900/30" : "bg-yellow-100"}`, children: _jsx(Lightbulb, { className: `w-8 h-8 ${isDark ? "text-yellow-400" : "text-yellow-600"}` }) }), _jsxs("div", { children: [_jsx("h3", { className: `text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`, children: "Lampu" }), _jsx("p", { className: `text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Kontrol pencahayaan ruangan" })] })] }), _jsxs("div", { className: `flex items-center justify-between mb-6 p-4 rounded-lg ${isLampOn
                                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                                    : isDark ? "bg-slate-700" : "bg-slate-100"}`, children: [_jsx("span", { className: `font-semibold ${isLampOn
                                            ? "text-yellow-700 dark:text-yellow-300"
                                            : isDark ? "text-slate-300" : "text-slate-700"}`, children: isLampOn ? "Menyala" : "Mati" }), _jsx(Power, { className: `w-5 h-5 ${isLampOn
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : isDark ? "text-slate-400" : "text-slate-500"}` })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: `text-sm font-medium mb-2 block ${isDark ? "text-slate-300" : "text-slate-700"}`, children: "Mode Kontrol" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => toggleMode("lamp"), className: `flex-1 px-4 py-2 rounded-lg font-medium transition-all ${modes.lamp === "manual" ? "bg-blue-600 text-white shadow-md" : isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`, children: "Manual" }), _jsx("button", { onClick: () => toggleMode("lamp"), className: `flex-1 px-4 py-2 rounded-lg font-medium transition-all ${modes.lamp === "auto" ? "bg-green-600 text-white shadow-md" : isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`, children: "Otomatis" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => handleDeviceControl("lamp", "on"), disabled: loading.lamp || isLampOn, className: `flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${loading.lamp || isLampOn
                                            ? isDark
                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl"}`, children: "Nyalakan" }), _jsx("button", { onClick: () => handleDeviceControl("lamp", "off"), disabled: loading.lamp || !isLampOn, className: `flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${loading.lamp || !isLampOn
                                            ? isDark
                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl"}`, children: "Matikan" })] })] }), _jsxs("div", { className: `rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`, children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("div", { className: `p-3 rounded-xl ${isDark ? "bg-blue-900/30" : "bg-blue-100"}`, children: _jsx(Wind, { className: `w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}` }) }), _jsxs("div", { children: [_jsx("h3", { className: `text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`, children: "Gorden" }), _jsx("p", { className: `text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Kontrol pembukaan gorden" })] })] }), _jsxs("div", { className: `flex items-center justify-between mb-6 p-4 rounded-lg ${isCurtainOpen
                                    ? "bg-blue-100 dark:bg-blue-900/30"
                                    : isDark ? "bg-slate-700" : "bg-slate-100"}`, children: [_jsx("span", { className: `font-semibold ${isCurtainOpen
                                            ? "text-blue-700 dark:text-blue-300"
                                            : isDark ? "text-slate-300" : "text-slate-700"}`, children: isCurtainOpen ? "Terbuka" : "Tertutup" }), _jsx(Wind, { className: `w-5 h-5 ${isCurtainOpen
                                            ? "text-blue-600 dark:text-blue-400"
                                            : isDark ? "text-slate-400" : "text-slate-500"}` })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: `text-sm font-medium mb-2 block ${isDark ? "text-slate-300" : "text-slate-700"}`, children: "Mode Kontrol" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => toggleMode("curtain"), className: `flex-1 px-4 py-2 rounded-lg font-medium transition-all ${modes.curtain === "manual" ? "bg-blue-600 text-white shadow-md" : isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`, children: "Manual" }), _jsx("button", { onClick: () => toggleMode("curtain"), className: `flex-1 px-4 py-2 rounded-lg font-medium transition-all ${modes.curtain === "auto" ? "bg-green-600 text-white shadow-md" : isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`, children: "Otomatis" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => handleDeviceControl("curtain", "open"), disabled: loading.curtain || isCurtainOpen, className: `flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${loading.curtain || isCurtainOpen
                                            ? isDark
                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"}`, children: "Buka" }), _jsx("button", { onClick: () => handleDeviceControl("curtain", "close"), disabled: loading.curtain || !isCurtainOpen, className: `flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${loading.curtain || !isCurtainOpen
                                            ? isDark
                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl"}`, children: "Tutup" })] })] })] })] }));
}
