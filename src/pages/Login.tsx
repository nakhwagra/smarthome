// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login(): JSX.Element {
    const auth = useAuth(); // whatever your AuthContext exposes
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);

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

            if (!body.success || !body.data?.token) {
                setErr(body.message || "Login gagal");
                setLoading(false);
                return;
            }

            const { token, user } = body.data;

            // Simpan auth state
            if (auth && typeof (auth as any).login === "function") {
                try {
                    // try calling with a common object first
                    (auth as any).login({ token, user, remember });
                } catch {
                    // fallback: maybe login expects a token string
                    try {
                        (auth as any).login(token);
                    } catch {
                        // final fallback: store token to storage ourselves
                        if (token) {
                            if (remember) {
                                localStorage.setItem("auth_token", token);
                                localStorage.setItem("auth_user", JSON.stringify(user));
                            } else {
                                sessionStorage.setItem("auth_token", token);
                                sessionStorage.setItem("auth_user", JSON.stringify(user));
                            }
                        }
                    }
                }
            } else {
                // no auth context: save token manually
                if (token) {
                    if (remember) {
                        localStorage.setItem("auth_token", token);
                        localStorage.setItem("auth_user", JSON.stringify(user));
                    } else {
                        sessionStorage.setItem("auth_token", token);
                        sessionStorage.setItem("auth_user", JSON.stringify(user));
                    }
                }
            }

            // If no token but backend returned success differently, still navigate
            navigate("/");
        } catch (error: any) {
            const msg =
                error?.response?.data?.error ??
                error?.response?.data?.message ??
                error?.message ??
                "Login failed";
            setErr(String(msg));
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-full max-w-4xl mx-4 lg:mx-0 bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                {/* Left - visual */}
                <div className="hidden lg:flex flex-col p-10 bg-gradient-to-b from-indigo-600 to-violet-600 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="font-bold text-2xl bg-white/10 rounded-full px-3 py-2"></div>
                        <div>
                            <h1 className="text-xl font-semibold">SmartHome</h1>
                            <p className="text-sm opacity-90">IoT Dashboard</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold mb-3">Welcome back</h2>
                        <p className="text-md opacity-90 mb-6">Login to monitor sensors, control devices, and view access logs in realtime.</p>

                        <div className="grid gap-4 text-sm">
                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="font-medium">Live sensor data</p>
                                <p className="mt-1 text-xs opacity-90">Temperature, humidity, gas levels and device status in one place.</p>
                            </div>

                            <div className="bg-white/10 rounded-lg p-4">
                                <p className="font-medium">Device control</p>
                                <p className="mt-1 text-xs opacity-90">Turn lights on/off, lock/unlock doors, manage curtains.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-xs opacity-80">
                        <p>Need help? Contact <span className="underline">admin@smarthome.local</span></p>
                    </div>
                </div>

                {/* Right - form */}
                <div className="p-8 lg:p-12">
                    <div className="mb-6">
                        <h3 className="text-2xl font-semibold text-slate-800">Sign in to your account</h3>
                        <p className="text-sm text-slate-500 mt-1">Use your company account or test admin credentials.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4" noValidate>
                        {err && (
                            <div className="rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-2 text-sm">
                                {err}
                            </div>
                        )}

                        <label className="block">
                            <span className="text-sm text-slate-600">Email</span>
                            <input
                                autoFocus
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                required
                            />
                        </label>

                        <label className="block">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Password</span>
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
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                                required
                            />
                        </label>

                        <div className="flex items-center justify-between">
                            <label className="inline-flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                                <span className="text-slate-600">Remember me</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => {
                                    setEmail("admin@gmail.com");
                                    setPassword("admin123");
                                }}
                                className="text-sm text-slate-500 hover:underline"
                            >
                                Use test credentials
                            </button>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-white ${loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"}`}
                            >
                                {loading ? "Signing in…" : "Sign in"}
                            </button>
                        </div>

                        <div className="pt-2">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden>
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-3 text-slate-500">or continue with</span>
                                </div>
                            </div>

                            <div className="mt-3 flex gap-3">
                                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M21 12.3c0-.76-.07-1.49-.2-2.2H12v4.16h5.33c-.23 1.3-1 2.42-2.14 3.17v2.6h3.45C20.1 18.73 21 15.79 21 12.3z" fill="#4285F4" /></svg>
                                    Google
                                </button>
                                <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z" fill="#111827" /></svg>
                                    GitHub
                                </button>
                            </div>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); alert("Register flow not implemented"); }} className="text-indigo-600 hover:underline">Contact admin</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
