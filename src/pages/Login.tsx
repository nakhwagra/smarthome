// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Loader } from "lucide-react";
import authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Login(): JSX.Element {
    const auth = useAuth();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        if (!email.trim() || !password) {
            setErr("Please fill both email and password.");
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.login({ email, password });
            const body = res.data;

            console.log("Login response:", body); // Debug log

            if (!body.success) {
                setErr(body.message || "Login gagal");
                setLoading(false);
                return;
            }

            // Handle both response formats
            const token = body.data?.token || body.token;
            const user = body.data?.user || body.user;

            if (!token) {
                setErr("No token received from server");
                setLoading(false);
                return;
            }

            console.log("Token:", token, "User:", user); // Debug log

            // Save to auth context first
            if (auth && typeof auth.login === "function") {
                auth.login(token, user);
            } else {
                // Fallback: save to localStorage directly
                localStorage.setItem("auth_token", token);
                if (user) localStorage.setItem("auth_user", JSON.stringify(user));
            }

            // Small delay to ensure state updates before navigation
            setTimeout(() => {
                console.log("Navigating to /dashboard"); // Debug log
                navigate("/dashboard");
            }, 100);
        } catch (error: unknown) {
            const errorObj = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
            const msg =
                errorObj?.response?.data?.error ??
                errorObj?.response?.data?.message ??
                errorObj?.message ??
                "Login failed";
            setErr(String(msg));
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute p-2 transition-colors rounded-lg top-6 right-6 hover:bg-white/10 dark:hover:bg-slate-700/50"
                title={isDark ? "Light Mode" : "Dark Mode"}
            >
                {isDark ? (
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                )}
            </button>

            <div className={`w-full max-w-4xl mx-4 lg:mx-0 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                {/* Left - Visual Section */}
                <div className="flex-col hidden p-10 text-white lg:flex bg-gradient-to-b from-indigo-600 to-violet-600">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="text-2xl font-bold"></div>
                        <div>
                            <h1 className="text-xl font-semibold">SmartHome</h1>
                            <p className="text-sm opacity-90">IoT Dashboard</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center flex-1">
                        <h2 className="mb-3 text-3xl font-bold">Welcome back TESTING</h2>
                        <p className="mb-6 text-md opacity-90">Login to monitor sensors, control devices, and view access logs in realtime.</p>

                        <div className="grid gap-4 text-sm">
                            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                                <p className="font-medium">Live sensor data</p>
                                <p className="mt-1 text-xs opacity-90">Temperature, humidity, gas levels and device status in one place.</p>
                            </div>

                            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                                <p className="font-medium">Device control</p>
                                <p className="mt-1 text-xs opacity-90">Turn lights on/off, lock/unlock doors, manage curtains.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-xs opacity-80">
                        <p>Need help? Contact <span className="underline">admin@smarthome.local</span></p>
                    </div>
                </div>

                {/* Right - Login Form */}
                <div className={`p-8 lg:p-12 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                    <div className="mb-6">
                        <h3 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Sign in to your account</h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Use your company account or test admin credentials.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4" noValidate>
                        {err && (
                            <div className={`rounded-md border px-4 py-2 text-sm ${isDark ? "bg-red-900/30 border-red-800 text-red-300" : "bg-red-50 border-red-100 text-red-700"}`}>
                                {err}
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>Email</label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                <input
                                    autoFocus
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg border-2 transition-all ${
                                        isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    }`}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Password</label>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert("Reset password flow not implemented yet");
                                    }}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-2 rounded-lg border-2 transition-all ${
                                        isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute -translate-y-1/2 right-3 top-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                    ) : (
                                        <Eye className={`w-5 h-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Test Credentials */}
                        <div className="flex items-center justify-between">
                            <label className={`inline-flex items-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                                <span>Remember me</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => {
                                    setEmail("admin@gmail.com");
                                    setPassword("admin123");
                                }}
                                className={`text-sm hover:underline ${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Use test credentials
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                loading
                                    ? isDark
                                        ? "bg-indigo-900/50 text-indigo-300 cursor-not-allowed"
                                        : "bg-indigo-200 text-indigo-600 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
                            }`}
                        >
                            {loading && <Loader className="w-4 h-4 animate-spin" />}
                            {loading ? "Signing in…" : "Sign in"}
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className={`absolute inset-0 flex items-center ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                                <div className={`w-full border-t ${isDark ? "border-slate-700" : "border-slate-200"}`} />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className={`${isDark ? "bg-slate-800 text-slate-500" : "bg-white text-slate-500"} px-3`}>or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="flex gap-3">
                            <button type="button" className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${isDark ? "border-slate-600 hover:bg-slate-700" : "border-slate-200 hover:bg-slate-50"}`}>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M21 12.3c0-.76-.07-1.49-.2-2.2H12v4.16h5.33c-.23 1.3-1 2.42-2.14 3.17v2.6h3.45C20.1 18.73 21 15.79 21 12.3z" fill="#4285F4" /></svg>
                                <span className={isDark ? "text-slate-200" : "text-slate-900"}>Google</span>
                            </button>
                            <button type="button" className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${isDark ? "border-slate-600 hover:bg-slate-700" : "border-slate-200 hover:bg-slate-50"}`}>
                                <svg className={`w-4 h-4 ${isDark ? "text-slate-300" : "text-slate-900"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z" /></svg>
                                <span className={isDark ? "text-slate-200" : "text-slate-900"}>GitHub</span>
                            </button>
                        </div>
                    </form>

                    <p className={`mt-6 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); alert("Register flow not implemented"); }} className="text-indigo-600 hover:underline">Contact admin</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
