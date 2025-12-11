// src/pages/Register.tsx
import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader } from "lucide-react";
import authApi from "../api/authApi";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/black.png";

export default function Register(): JSX.Element {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [faceImage, setFaceImage] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Mulai webcam untuk capture wajah
    const startCamera = async () => {
        setErr(null);
        setCapturing(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            streamRef.current = stream;
        } catch (error) {
            setErr("Gagal mengakses kamera. Pastikan izin kamera diaktifkan.");
            setCapturing(false);
        }
    };

    // Stop webcam
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCapturing(false);
    };

    // Capture foto dari webcam
    const captureFace = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Convert ke base64
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);
        setFaceImage(base64Image);
        stopCamera();
        setSuccess("Foto wajah berhasil diambil!");
    };

    // Reset foto wajah
    const resetFace = () => {
        setFaceImage(null);
        setSuccess(null);
    };

    // Submit registrasi
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setSuccess(null);

        // Validasi
        if (!name.trim() || !email.trim() || !password) {
            setErr("Semua field harus diisi");
            return;
        }

        if (password.length < 6) {
            setErr("Password minimal 6 karakter");
            return;
        }

        if (password !== confirmPassword) {
            setErr("Password dan konfirmasi tidak cocok");
            return;
        }

        if (!faceImage) {
            setErr("Silakan ambil foto wajah terlebih dahulu");
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.register({
                name,
                email,
                password,
                face_image: faceImage
            });

            const body = res.data;

            if (!body.success) {
                setErr(body.message || "Registrasi gagal");
                setLoading(false);
                return;
            }

            setSuccess("Registrasi berhasil! Menunggu persetujuan admin.");
            
            // Redirect ke login setelah 3 detik
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "Terjadi kesalahan";
            setErr(msg);
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
            {/* Theme Toggle - Same as Login */}
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
                    <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                ) : (
                    <svg
                        className="w-5 h-5 text-slate-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                )}
            </button>

            <div
                className={`w-full max-w-5xl mx-4 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5 ${
                    isDark ? "bg-slate-800" : "bg-white"
                }`}
            >
                {/* Left Panel - Gradient Branding */}
                <div className="md:col-span-2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-20 right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <img src={logo} alt="SHIELD logo" className="h-6 w-auto object-contain" />
                            </div>
                            <span className="text-xl font-semibold">SHIELD</span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                            Start your smart<br />home journey today.
                        </h1>
                        <p className="text-white/80 text-sm">
                            Create your SmartHome account and manage your devices seamlessly.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <p className="text-xs text-white/60">© 2025 Smart Home Intergrated Electronic Lock Device</p>
                    </div>
                </div>

                {/* Right Panel - Register Form */}
                <div
                    className={`md:col-span-3 p-8 lg:p-16 flex flex-col justify-center ${
                        isDark ? "bg-slate-800" : "bg-white"
                    }`}
                >
                    <div className="mb-6">
                        <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            Create Account
                        </h2>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Join the SmartHome IoT System.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4" noValidate>
                        {err && (
                            <div
                                className={`rounded-lg px-4 py-3 text-sm ${
                                    isDark
                                        ? "bg-red-900/30 border border-red-800 text-red-300"
                                        : "bg-red-50 border border-red-200 text-red-700"
                                }`}
                            >
                                {err}
                            </div>
                        )}

                        {success && (
                            <div
                                className={`rounded-lg px-4 py-3 text-sm ${
                                    isDark
                                        ? "bg-green-900/30 border border-green-800 text-green-300"
                                        : "bg-green-50 border border-green-200 text-green-700"
                                }`}
                            >
                                {success}
                            </div>
                        )}

                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${
                                    isDark ? "text-slate-300" : "text-slate-700"
                                }`}
                            >
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className={`w-full px-4 py-3 rounded-lg border transition-all ${
                                    isDark
                                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                }`}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${
                                    isDark ? "text-slate-300" : "text-slate-700"
                                }`}
                            >
                                Email
                            </label>
                            <input
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
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${
                                    isDark ? "text-slate-300" : "text-slate-700"
                                }`}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all ${
                                        isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    }`}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <EyeOff className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                    ) : (
                                        <Eye className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                className={`block text-sm font-medium mb-2 ${
                                    isDark ? "text-slate-300" : "text-slate-700"
                                }`}
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all ${
                                        isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    }`}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                    ) : (
                                        <Eye className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Face Capture */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <label
                                className={`block text-sm font-medium mb-3 ${
                                    isDark ? "text-slate-300" : "text-slate-700"
                                }`}
                            >
                                Face Photo
                            </label>

                            {!faceImage && !capturing && (
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                                        isDark
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                                    }`}
                                    disabled={loading}
                                >
                                    Capture face photo
                                </button>
                            )}

                            {capturing && (
                                <div
                                    className={`rounded-lg overflow-hidden border-2 border-indigo-500 ${
                                        isDark ? "bg-slate-700" : "bg-slate-100"
                                    }`}
                                >
                                    <video ref={videoRef} className="w-full" autoPlay playsInline />
                                    <div className="flex gap-3 p-4">
                                        <button
                                            type="button"
                                            onClick={captureFace}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold transition-all"
                                        >
                                            Capture
                                        </button>
                                        <button
                                            type="button"
                                            onClick={stopCamera}
                                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                                                isDark
                                                    ? "bg-slate-600 hover:bg-slate-500 text-white"
                                                    : "bg-slate-300 hover:bg-slate-400 text-slate-900"
                                            }`}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {faceImage && (
                                <div
                                    className={`rounded-lg overflow-hidden border-2 border-green-500 p-4 text-center ${
                                        isDark ? "bg-slate-700" : "bg-slate-100"
                                    }`}
                                >
                                    <img
                                        src={faceImage}
                                        alt="Captured face"
                                        className="w-full h-48 object-cover rounded mb-3"
                                    />
                                    <button
                                        type="button"
                                        onClick={resetFace}
                                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                                            isDark
                                                ? "bg-slate-600 hover:bg-slate-500 text-white"
                                                : "bg-slate-300 hover:bg-slate-400 text-slate-900"
                                        }`}
                                        disabled={loading}
                                    >
                                        Retake photo
                                    </button>
                                </div>
                            )}

                            <canvas ref={canvasRef} style={{ display: "none" }} />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !faceImage}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mt-6 ${
                                loading || !faceImage
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-900/50 text-slate-400 cursor-not-allowed"
                                    : isDark
                                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                            }`}
                        >
                            {loading && <Loader className="w-4 h-4 animate-spin" />}
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                        <p className={`text-xs text-center mt-3 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                            Account will be activated after admin approval.
                        </p>

                        <div className={`text-center text-sm mt-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className={`font-medium ${
                                    isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
                                } hover:underline`}
                            >
                                Login.
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}