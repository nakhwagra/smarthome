var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/admin/Settings.tsx
import { useEffect, useState } from "react";
import { Key, AlertCircle, CheckCircle } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useTheme } from "../../context/ThemeContext";
export default function Settings() {
    const [currentPin, setCurrentPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { isDark } = useTheme();
    useEffect(() => {
        fetchCurrentPin();
    }, []);
    const fetchCurrentPin = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axiosClient.get("/admin/pin");
            if (res.data.success && res.data.data) {
                setCurrentPin(res.data.data.universal_pin || "");
            }
        }
        catch (err) {
            console.error("Failed to fetch current PIN:", err);
        }
    });
    const handleUpdatePin = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        e.preventDefault();
        setError(null);
        setSuccess(null);
        // Validasi
        if (!newPin || newPin.length !== 6) {
            setError("PIN harus 6 digit");
            return;
        }
        if (!/^\d{6}$/.test(newPin)) {
            setError("PIN harus berupa angka");
            return;
        }
        if (newPin !== confirmPin) {
            setError("PIN dan konfirmasi tidak cocok");
            return;
        }
        setLoading(true);
        try {
            const res = yield axiosClient.post("/admin/pin", { pin: newPin });
            if (res.data.success) {
                setSuccess("PIN berhasil diperbarui");
                setCurrentPin(newPin);
                setNewPin("");
                setConfirmPin("");
            }
        }
        catch (err) {
            const axiosErr = err;
            setError(((_b = (_a = axiosErr === null || axiosErr === void 0 ? void 0 : axiosErr.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Gagal memperbarui PIN");
        }
        finally {
            setLoading(false);
        }
    });
    return (_jsxs("div", { className: `min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`, children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: `text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`, children: "Pengaturan" }), _jsx("p", { className: `mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Kelola pengaturan sistem" })] }), _jsxs("div", { className: `max-w-2xl rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`, children: [_jsxs("div", { className: "flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700", children: [_jsx("div", { className: `p-3 rounded-xl ${isDark ? "bg-purple-900/30" : "bg-purple-100"}`, children: _jsx(Key, { className: `w-6 h-6 ${isDark ? "text-purple-400" : "text-purple-600"}` }) }), _jsxs("div", { children: [_jsx("h2", { className: `text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`, children: "Universal PIN" }), _jsx("p", { className: `text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`, children: "Pengaturan PIN untuk akses pintu" })] })] }), error && (_jsxs("div", { className: `mb-6 flex items-center gap-3 p-4 rounded-lg ${isDark ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"}`, children: [_jsx(AlertCircle, { className: `w-5 h-5 flex-shrink-0 ${isDark ? "text-red-400" : "text-red-600"}` }), _jsx("p", { className: `text-sm ${isDark ? "text-red-300" : "text-red-700"}`, children: error })] })), success && (_jsxs("div", { className: `mb-6 flex items-center gap-3 p-4 rounded-lg ${isDark ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"}`, children: [_jsx(CheckCircle, { className: `w-5 h-5 flex-shrink-0 ${isDark ? "text-green-400" : "text-green-600"}` }), _jsx("p", { className: `text-sm ${isDark ? "text-green-300" : "text-green-700"}`, children: success })] })), _jsxs("div", { className: `mb-8 p-6 rounded-xl ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`, children: [_jsx("p", { className: `text-sm font-medium mb-3 ${isDark ? "text-slate-400" : "text-slate-700"}`, children: "PIN Aktif Saat Ini" }), _jsx("div", { className: `text-4xl font-bold tracking-widest font-mono ${isDark ? "text-purple-400" : "text-purple-600"}`, children: currentPin || "------" })] }), _jsxs("form", { onSubmit: handleUpdatePin, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "newPin", className: `block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`, children: "PIN Baru (6 digit)" }), _jsx("input", { id: "newPin", type: "text", value: newPin, onChange: (e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6)), placeholder: "000000", maxLength: 6, disabled: loading, className: `w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 rounded-lg border-2 transition-all ${isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"} disabled:opacity-50 disabled:cursor-not-allowed` })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPin", className: `block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`, children: "Konfirmasi PIN" }), _jsx("input", { id: "confirmPin", type: "text", value: confirmPin, onChange: (e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6)), placeholder: "000000", maxLength: 6, disabled: loading, className: `w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 rounded-lg border-2 transition-all ${isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"} disabled:opacity-50 disabled:cursor-not-allowed` })] }), newPin && confirmPin && newPin !== confirmPin && (_jsxs("div", { className: `flex items-center gap-2 p-3 rounded-lg ${isDark ? "bg-yellow-900/20 text-yellow-300" : "bg-yellow-50 text-yellow-700"}`, children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsx("p", { className: "text-sm", children: "PIN tidak cocok" })] })), _jsx("button", { type: "submit", disabled: loading || !newPin || !confirmPin || newPin !== confirmPin, className: `w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${loading || !newPin || !confirmPin || newPin !== confirmPin
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"}`, children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" }), "Memperbarui..."] })) : (_jsxs(_Fragment, { children: [_jsx(Key, { className: "w-5 h-5" }), "Perbarui PIN"] })) })] }), _jsx("div", { className: `mt-6 p-4 rounded-lg ${isDark ? "bg-orange-900/20 border border-orange-800" : "bg-orange-50 border border-orange-200"}`, children: _jsxs("p", { className: `text-sm flex items-start gap-2 ${isDark ? "text-orange-300" : "text-orange-700"}`, children: [_jsx(AlertCircle, { className: "w-5 h-5 flex-shrink-0 mt-0.5" }), _jsxs("span", { children: [_jsx("strong", { children: "Perhatian:" }), " PIN ini digunakan sebagai fallback untuk membuka pintu melalui keypad ESP32. Jangan bagikan PIN ini kepada orang yang tidak berwenang."] })] }) })] })] }));
}
