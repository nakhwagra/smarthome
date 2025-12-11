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
// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Loader } from "lucide-react";
import authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
export default function Login() {
    const auth = useAuth();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const submit = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        e.preventDefault();
        setErr(null);
        if (!email.trim() || !password) {
            setErr("Please fill both email and password.");
            return;
        }
        setLoading(true);
        try {
            const res = yield authApi.login({ email, password });
            const body = res.data;
            console.log("Login response:", body); // Debug log
            if (!body.success) {
                setErr(body.message || "Login gagal");
                setLoading(false);
                return;
            }
            // Handle both response formats
            const token = ((_a = body.data) === null || _a === void 0 ? void 0 : _a.token) || body.token;
            const user = ((_b = body.data) === null || _b === void 0 ? void 0 : _b.user) || body.user;
            if (!token) {
                setErr("No token received from server");
                setLoading(false);
                return;
            }
            console.log("Token:", token, "User:", user); // Debug log
            // Save to auth context first
            if (auth && typeof auth.login === "function") {
                auth.login(token, user);
            }
            else {
                // Fallback: save to localStorage directly
                localStorage.setItem("auth_token", token);
                if (user)
                    localStorage.setItem("auth_user", JSON.stringify(user));
            }
            // Small delay to ensure state updates before navigation
            setTimeout(() => {
                console.log("Navigating to /dashboard"); // Debug log
                navigate("/dashboard");
            }, 100);
        }
        catch (error) {
            const msg = (_j = (_h = (_e = (_d = (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) !== null && _e !== void 0 ? _e : (_g = (_f = error === null || error === void 0 ? void 0 : error.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.message) !== null && _h !== void 0 ? _h : error === null || error === void 0 ? void 0 : error.message) !== null && _j !== void 0 ? _j : "Login failed";
            setErr(String(msg));
            console.error("Login error:", error);
        }
        finally {
            setLoading(false);
        }
    });
    return (_jsxs("div", { className: `min-h-screen flex items-center justify-center ${isDark ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-slate-50 to-slate-100"}`, children: [_jsx("button", { onClick: toggleTheme, className: "absolute top-6 right-6 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700/50 transition-colors", title: isDark ? "Light Mode" : "Dark Mode", children: isDark ? (_jsx("svg", { className: "w-5 h-5 text-yellow-400", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" }) })) : (_jsx("svg", { className: "w-5 h-5 text-slate-700", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }) })) }), _jsxs("div", { className: `w-full max-w-4xl mx-4 lg:mx-0 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 ${isDark ? "bg-slate-800" : "bg-white"}`, children: [_jsxs("div", { className: "hidden lg:flex flex-col p-10 bg-gradient-to-b from-indigo-600 to-violet-600 text-white", children: [_jsxs("div", { className: "flex items-center gap-3 mb-8", children: [_jsx("div", { className: "font-bold text-2xl", children: "\uD83C\uDFE0" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold", children: "SmartHome" }), _jsx("p", { className: "text-sm opacity-90", children: "IoT Dashboard" })] })] }), _jsxs("div", { className: "flex-1 flex flex-col justify-center", children: [_jsx("h2", { className: "text-3xl font-bold mb-3", children: "Welcome back" }), _jsx("p", { className: "text-md opacity-90 mb-6", children: "Login to monitor sensors, control devices, and view access logs in realtime." }), _jsxs("div", { className: "grid gap-4 text-sm", children: [_jsxs("div", { className: "bg-white/10 rounded-lg p-4 backdrop-blur", children: [_jsx("p", { className: "font-medium", children: "Live sensor data" }), _jsx("p", { className: "mt-1 text-xs opacity-90", children: "Temperature, humidity, gas levels and device status in one place." })] }), _jsxs("div", { className: "bg-white/10 rounded-lg p-4 backdrop-blur", children: [_jsx("p", { className: "font-medium", children: "Device control" }), _jsx("p", { className: "mt-1 text-xs opacity-90", children: "Turn lights on/off, lock/unlock doors, manage curtains." })] })] })] }), _jsx("div", { className: "mt-8 text-xs opacity-80", children: _jsxs("p", { children: ["Need help? Contact ", _jsx("span", { className: "underline", children: "admin@smarthome.local" })] }) })] }), _jsxs("div", { className: `p-8 lg:p-12 ${isDark ? "bg-slate-800" : "bg-white"}`, children: [_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: `text-2xl font-semibold ${isDark ? "text-white" : "text-slate-800"}`, children: "Sign in to your account" }), _jsx("p", { className: `text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`, children: "Use your company account or test admin credentials." })] }), _jsxs("form", { onSubmit: submit, className: "space-y-4", noValidate: true, children: [err && (_jsx("div", { className: `rounded-md border px-4 py-2 text-sm ${isDark ? "bg-red-900/30 border-red-800 text-red-300" : "bg-red-50 border-red-100 text-red-700"}`, children: err })), _jsxs("div", { children: [_jsx("label", { className: `block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`, children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: `absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}` }), _jsx("input", { autoFocus: true, type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", className: `w-full pl-10 pr-4 py-2 rounded-lg border-2 transition-all ${isDark
                                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                                            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"}`, required: true })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("label", { className: `block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`, children: "Password" }), _jsx("a", { href: "#", onClick: (e) => {
                                                            e.preventDefault();
                                                            alert("Reset password flow not implemented yet");
                                                        }, className: "text-sm text-indigo-600 hover:underline", children: "Forgot?" })] }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: `absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}` }), _jsx("input", { type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: `w-full pl-10 pr-10 py-2 rounded-lg border-2 transition-all ${isDark
                                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                                            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"}`, required: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2", children: showPassword ? (_jsx(EyeOff, { className: `w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}` })) : (_jsx(Eye, { className: `w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}` })) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: `inline-flex items-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`, children: [_jsx("input", { type: "checkbox", checked: remember, onChange: (e) => setRemember(e.target.checked), className: "h-4 w-4 rounded border-slate-300" }), _jsx("span", { children: "Remember me" })] }), _jsx("button", { type: "button", onClick: () => {
                                                    setEmail("admin@gmail.com");
                                                    setPassword("admin123");
                                                }, className: `text-sm hover:underline ${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`, children: "Use test credentials" })] }), _jsxs("button", { type: "submit", disabled: loading, className: `w-full py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${loading
                                            ? isDark
                                                ? "bg-indigo-900/50 text-indigo-300 cursor-not-allowed"
                                                : "bg-indigo-200 text-indigo-600 cursor-not-allowed"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"}`, children: [loading && _jsx(Loader, { className: "w-4 h-4 animate-spin" }), loading ? "Signing in…" : "Sign in"] }), _jsxs("div", { className: "relative my-6", children: [_jsx("div", { className: `absolute inset-0 flex items-center ${isDark ? "border-slate-700" : "border-slate-200"}`, children: _jsx("div", { className: `w-full border-t ${isDark ? "border-slate-700" : "border-slate-200"}` }) }), _jsx("div", { className: "relative flex justify-center text-xs", children: _jsx("span", { className: `${isDark ? "bg-slate-800 text-slate-500" : "bg-white text-slate-500"} px-3`, children: "or continue with" }) })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { type: "button", className: `flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${isDark ? "border-slate-600 hover:bg-slate-700" : "border-slate-200 hover:bg-slate-50"}`, children: [_jsx("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M21 12.3c0-.76-.07-1.49-.2-2.2H12v4.16h5.33c-.23 1.3-1 2.42-2.14 3.17v2.6h3.45C20.1 18.73 21 15.79 21 12.3z", fill: "#4285F4" }) }), _jsx("span", { className: isDark ? "text-slate-200" : "text-slate-900", children: "Google" })] }), _jsxs("button", { type: "button", className: `flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${isDark ? "border-slate-600 hover:bg-slate-700" : "border-slate-200 hover:bg-slate-50"}`, children: [_jsx("svg", { className: `w-4 h-4 ${isDark ? "text-slate-300" : "text-slate-900"}`, viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z" }) }), _jsx("span", { className: isDark ? "text-slate-200" : "text-slate-900", children: "GitHub" })] })] })] }), _jsxs("p", { className: `mt-6 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`, children: ["Don't have an account? ", _jsx("a", { href: "#", onClick: (e) => { e.preventDefault(); alert("Register flow not implemented"); }, className: "text-indigo-600 hover:underline", children: "Contact admin" })] })] })] })] }));
}
