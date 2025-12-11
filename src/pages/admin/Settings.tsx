// src/pages/admin/Settings.tsx
import React, { useEffect, useState } from "react";
import { Key, AlertCircle, CheckCircle } from "lucide-react";
import adminApi from "../../api/adminApi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Settings(): JSX.Element {
    const [currentPin, setCurrentPin] = useState<string>("");
    const [newPin, setNewPin] = useState<string>("");
    const [confirmPin, setConfirmPin] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { isDark } = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        fetchCurrentPin();
    }, []);

    const fetchCurrentPin = async () => {
        try {
            const res = await adminApi.getUniversalPin();
            if (res.data.success && res.data.data) {
                setCurrentPin(res.data.data.universal_pin || "");
            }
        } catch (err) {
            console.error("Failed to fetch current PIN:", err);
        }
    };

    const handleUpdatePin = async (e: React.FormEvent) => {
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
            // Get user ID from AuthContext or localStorage
            console.log("🔍 Debug user from AuthContext:", user);
            
            let userId = user?.user_id || user?.id;
            
            // Fallback: try localStorage directly
            if (!userId) {
                const storedUser = localStorage.getItem("auth_user");
                console.log("🔍 Stored user string:", storedUser);
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    console.log("🔍 Parsed user:", parsed);
                    userId = parsed.user_id || parsed.id;
                }
            }
            
            console.log("🔍 Final userId:", userId, "Type:", typeof userId);
            
            if (!userId) {
                setError("User tidak ditemukan. Silakan login ulang.");
                setLoading(false);
                return;
            }

            console.log("📤 Sending PIN update:", { universal_pin: newPin, set_by: userId });

            const res = await adminApi.setUniversalPin(newPin, Number(userId));
            
            console.log("✅ PIN update response:", res.data);
            
            if (res.data.success) {
                setSuccess("PIN berhasil diperbarui");
                setCurrentPin(newPin);
                setNewPin("");
                setConfirmPin("");
            }
        } catch (err: unknown) {
            console.error("❌ PIN update error:", err);
            const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
            setError(axiosErr?.response?.data?.message || axiosErr?.response?.data?.error || "Gagal memperbarui PIN");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Pengaturan
                </h1>
                <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Kelola pengaturan sistem
                </p>
            </div>

            {/* Settings Card */}
            <div className={`max-w-2xl rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                {/* Card Header */}
                <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className={`p-3 rounded-xl ${isDark ? "bg-purple-900/30" : "bg-purple-100"}`}>
                        <Key className={`w-6 h-6 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                    </div>
                    <div>
                        <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Universal PIN
                        </h2>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Pengaturan PIN untuk akses pintu
                        </p>
                    </div>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className={`mb-6 flex items-center gap-3 p-4 rounded-lg ${isDark ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"}`}>
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />
                        <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>{error}</p>
                    </div>
                )}

                {success && (
                    <div className={`mb-6 flex items-center gap-3 p-4 rounded-lg ${isDark ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"}`}>
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-green-400" : "text-green-600"}`} />
                        <p className={`text-sm ${isDark ? "text-green-300" : "text-green-700"}`}>{success}</p>
                    </div>
                )}

                {/* Current PIN Display */}
                <div className={`mb-8 p-6 rounded-xl ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}>
                    <p className={`text-sm font-medium mb-3 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                        PIN Aktif Saat Ini
                    </p>
                    <div className={`text-4xl font-bold tracking-widest font-mono ${
                        isDark ? "text-purple-400" : "text-purple-600"
                    }`}>
                        {currentPin || "------"}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdatePin} className="space-y-6">
                    {/* New PIN Input */}
                    <div>
                        <label htmlFor="newPin" className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            PIN Baru (6 digit)
                        </label>
                        <input
                            id="newPin"
                            type="text"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            disabled={loading}
                            className={`w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 rounded-lg border-2 transition-all ${
                                isDark
                                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                    </div>

                    {/* Confirm PIN Input */}
                    <div>
                        <label htmlFor="confirmPin" className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            Konfirmasi PIN
                        </label>
                        <input
                            id="confirmPin"
                            type="text"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            disabled={loading}
                            className={`w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 rounded-lg border-2 transition-all ${
                                isDark
                                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                    </div>

                    {/* PIN Mismatch Warning */}
                    {newPin && confirmPin && newPin !== confirmPin && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? "bg-yellow-900/20 text-yellow-300" : "bg-yellow-50 text-yellow-700"}`}>
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-sm">PIN tidak cocok</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading || !newPin || !confirmPin || newPin !== confirmPin}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                            loading || !newPin || !confirmPin || newPin !== confirmPin
                                ? isDark
                                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current rounded-full border-r-transparent animate-spin" />
                                Memperbarui...
                            </>
                        ) : (
                            <>
                                <Key className="w-5 h-5" />
                                Perbarui PIN
                            </>
                        )}
                    </button>
                </form>

                {/* Warning Note */}
                <div className={`mt-6 p-4 rounded-lg ${isDark ? "bg-orange-900/20 border border-orange-800" : "bg-orange-50 border border-orange-200"}`}>
                    <p className={`text-sm flex items-start gap-2 ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>
                            <strong>Perhatian:</strong> PIN ini digunakan sebagai fallback untuk membuka pintu melalui keypad ESP32. Jangan bagikan PIN ini kepada orang yang tidak berwenang.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
