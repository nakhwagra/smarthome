import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader } from "lucide-react";
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

            if (!body.success) {
                setErr(body.message || "Login gagal");
                setLoading(false);
                return;
            }

            const token = body.data?.token || body.token;
            const user = body.data?.user || body.user;

            if (!token) {
                setErr("No token received from server");
                setLoading(false);
                return;
            }

            if (auth && typeof auth.login === "function") {
                auth.login(token, user);
            } else {
                localStorage.setItem("auth_token", token);
                if (user) localStorage.setItem("auth_user", JSON.stringify(user));
            }

            setTimeout(() => {
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
            {/* Theme Toggle - Same as Dashboard */}
            <button
                onClick={toggleTheme}
                className={`absolute top-6 right-6 p-2 rounded-lg transition-colors ${
                    isDark 
                        ? "bg-slate-700 hover:bg-slate-600" 
                        : "bg-slate-100 hover:bg-slate-200"
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDark ? (
                    // Light Mode Icon (Sun)
                    <svg 
                        className="w-5 h-5 text-yellow-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                ) : (
                    // Dark Mode Icon (Moon)
                    <svg 
                        className="w-5 h-5 text-slate-700" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                )}
            </button>

            <div className={`w-full max-w-5xl mx-4 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 ${
                isDark ? "bg-slate-800" : "bg-white"
            }`}>
                {/* Left Panel - Purple Gradient */}
                <div className="hidden lg:flex lg:col-span-2 p-12 flex-col justify-between bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                    
                    {/* Logo */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 text-xl font-bold">🏠</span>
                            </div>
                            <span className="text-xl font-semibold">SmartHome</span>
                        </div>
                    </div>

                    {/* Main Text */}
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold leading-tight mb-4">
                            Smart living<br />starts here.
                        </h1>
                        <p className="text-white/80 text-sm">
                            Seamless control, real-time insights.
                        </p>
                    </div>

                    {/* Bottom decoration */}
                    <div className="relative z-10">
                        <p className="text-xs text-white/60">
                            © 2024 SmartHome IoT Dashboard
                        </p>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className={`lg:col-span-3 p-8 lg:p-16 flex flex-col justify-center ${
                    isDark ? "bg-slate-800" : "bg-white"
                }`}>
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            Sign in
                        </h2>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Welcome back! Enter your details below.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5" noValidate>
                        {/* Error Message */}
                        {err && (
                            <div className={`rounded-lg px-4 py-3 text-sm ${
                                isDark 
                                    ? "bg-red-900/30 border border-red-800 text-red-300" 
                                    : "bg-red-50 border border-red-200 text-red-700"
                            }`}>
                                {err}
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${
                                isDark ? "text-slate-300" : "text-slate-700"
                            }`}>
                                Email address
                            </label>
                            <input
                                autoFocus
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                                    isDark
                                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                }`}
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={`block text-sm font-medium ${
                                    isDark ? "text-slate-300" : "text-slate-700"
                                }`}>
                                    Password
                                </label>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert("Reset password flow not implemented yet");
                                    }}
                                    className={`text-sm ${isDark ? "text-indigo-400" : "text-indigo-600"} hover:underline`}
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all ${
                                        isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                    ) : (
                                        <Eye className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="remember" className={`ml-2 text-sm ${
                                isDark ? "text-slate-400" : "text-slate-600"
                            }`}>
                                Keep me logged in
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                loading
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-900/50 text-slate-400 cursor-not-allowed"
                                    : isDark
                                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                            }`}
                        >
                            {loading && <Loader className="w-4 h-4 animate-spin" />}
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                        {/* Sign Up Link */}
                        <div className={`text-center text-sm mt-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className={`font-medium ${isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"} hover:underline`}
                            >
                                Register
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}