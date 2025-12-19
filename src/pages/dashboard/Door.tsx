import React, { useEffect, useState, useRef, useCallback } from "react";
import { Unlock, AlertCircle, CheckCircle, Lock } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useTheme } from "../../context/ThemeContext";

const PYTHON_SERVICE_URL = "http://localhost:5001";

export default function Door(): JSX.Element {
    const [doorStatus, setDoorStatus] = useState<string>("locked");
    const [loading, setLoading] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [faceRecognitionResult, setFaceRecognitionResult] = useState<{
        recognized: boolean;
        name?: string;
        confidence?: number;
        message?: string;
    } | null>(null);
    const [showPinInput, setShowPinInput] = useState(false);
    const [pinCode, setPinCode] = useState("");
    const [pinLoading, setPinLoading] = useState(false);
    const { isDark } = useTheme();
    const recognitionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastRecognitionTimeRef = useRef<number>(0);

    const ESP32_CAM_IP = "10.124.88.102";

    const fetchDoorStatus = useCallback(async () => {
        try {
            const res = await axiosClient.get("/device/door/latest");
            if (res.data.success && res.data.data) {
                setDoorStatus(res.data.data.status);
            }
        } catch (err) {
            console.error("Failed to fetch door status:", err);
        }
    }, []);

    const handleDoorUnlock = useCallback(async () => {
        setLoading(true);
        try {
            await axiosClient.post("/control/door", { action: "unlock" });
            // Optimistic update
            setDoorStatus("unlocked");
            
            // Auto-lock setelah 5 detik (sesuai dengan hardware behavior)
            setTimeout(() => {
                setDoorStatus("locked");
            }, 5000);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr?.response?.data?.message || "Gagal membuka pintu");
        } finally {
            setLoading(false);
        }
    }, []);

    const captureAndRecognizeFace = useCallback(async () => {
        setFaceRecognitionResult(null);
        
        try {
            // Fetch frame dari ESP32-CAM tanpa no-cors (backend Go bisa act as proxy)
            const frameResponse = await fetch(`http://${ESP32_CAM_IP}/640x480.jpg`);
            
            if (!frameResponse.ok) {
                console.error("Failed to fetch frame:", frameResponse.status);
                // recognition finished
                return;
            }

            const blob = await frameResponse.blob();
            const reader = new FileReader();

            reader.onload = async () => {
                const base64Image = reader.result as string;

                // Send LANGSUNG ke Python service untuk recognize
                try {
                    const recognizeResponse = await fetch(`${PYTHON_SERVICE_URL}/recognize-base64`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ image: base64Image })
                    });

                    const result = await recognizeResponse.json();

                    if (result.success) {
                        setFaceRecognitionResult({
                            recognized: result.recognized,
                            name: result.name,
                            confidence: result.confidence,
                            message: result.message
                        });

                        if (result.recognized) {
                            // Face recognized → otomatis buka pintu dalam 1 detik
                            setFaceDetected(true);
                            setShowPinInput(false);
                            
                            setTimeout(() => {
                                handleDoorUnlock();
                            }, 1000);
                        } else {
                            // Face detected tapi not recognized → show PIN
                            setFaceDetected(true);
                            setShowPinInput(true);
                        }
                    } else {
                        console.error(" Recognition failed:", result);
                    }
                } catch (err) {
                    console.error(" Face recognition error:", err);
                }

                // recognition finished
            };

            reader.onerror = () => {
                console.error(" FileReader error");
            };

            reader.readAsDataURL(blob);
        } catch (err) {
            console.error(" Capture error:", err);
            setFaceDetected(false);
        }
    }, [handleDoorUnlock]);

    const startAutoRecognition = useCallback(() => {
        // Auto-recognize face setiap 3 detik
        recognitionIntervalRef.current = setInterval(() => {
            const now = Date.now();
            // Avoid recognition spam - min 2 detik antara requests
            if (now - lastRecognitionTimeRef.current > 2000) {
                lastRecognitionTimeRef.current = now;
                captureAndRecognizeFace();
            }
        }, 3000);
    }, [captureAndRecognizeFace]);

    const stopAutoRecognition = useCallback(() => {
        if (recognitionIntervalRef.current) {
            clearInterval(recognitionIntervalRef.current);
            recognitionIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        fetchDoorStatus();
        startAutoRecognition();

        // Polling door status every 3 seconds instead of WebSocket
        const interval = setInterval(fetchDoorStatus, 3000);

        return () => {
            clearInterval(interval);
            stopAutoRecognition();
        };
    }, [fetchDoorStatus, startAutoRecognition, stopAutoRecognition]);

    const handlePinUnlock = async () => {
        if (!pinCode.trim()) {
            alert("Masukkan PIN terlebih dahulu");
            return;
        }

        setPinLoading(true);
        try {
            // POST ke backend Go untuk verify PIN dan unlock
            const res = await axiosClient.post("/control/door", { 
                action: "unlock",
                pin_code: pinCode,
                method: "pin"
            });

            if (res.data.success) {
                setDoorStatus("unlocked");
                setShowPinInput(false);
                setPinCode("");
                
                // Auto-lock setelah 5 detik
                setTimeout(() => {
                    setDoorStatus("locked");
                }, 5000);
            } else {
                alert("PIN salah!");
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr?.response?.data?.message || "Gagal unlock dengan PIN");
        } finally {
            setPinLoading(false);
        }
    };

    const isUnlocked = doorStatus === "unlocked";

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            {/* Page Header */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
                {/* Door Control Card */}
                <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                    <div className="mb-6">
                        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Kontrol Pintu
                        </h3>
                    </div>

                    {/* Status Display */}
                    <div className={`mb-6 p-6 rounded-xl text-center ${
                        isUnlocked 
                            ? "bg-green-100 dark:bg-green-900/30" 
                            : "bg-slate-100 dark:bg-slate-700"
                    }`}>
                        <div className="flex items-center justify-center mb-3">
                            {isUnlocked ? (
                                <Unlock className="w-12 h-12 text-green-600 dark:text-green-400" />
                            ) : (
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                                    isDark ? "bg-slate-600" : "bg-slate-300"
                                }`}>
                                    <div className={`w-6 h-6 rounded-full ${
                                        isDark ? "bg-slate-400" : "bg-slate-600"
                                    }`}></div>
                                </div>
                            )}
                        </div>
                        <p className={`text-2xl font-bold ${
                            isUnlocked
                                ? "text-green-700 dark:text-green-300"
                                : isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                            {isUnlocked ? "Pintu Terbuka" : "Pintu Terkunci"}
                        </p>
                        {isUnlocked && (
                            <p className={`text-sm mt-2 ${isDark ? "text-green-400" : "text-green-600"}`}>
                                Akan terkunci otomatis dalam 5 detik
                            </p>
                        )}
                    </div>

                    {/* Face Recognition Result */}
                    {faceDetected && faceRecognitionResult && (
                        <div className={`mb-6 p-4 rounded-xl ${
                            faceRecognitionResult.recognized
                                ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                                : "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"
                        }`}>
                            <div className="flex items-center gap-3 mb-2">
                                {faceRecognitionResult.recognized ? (
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                )}
                                <p className={`font-semibold ${
                                    faceRecognitionResult.recognized
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-yellow-700 dark:text-yellow-300"
                                }`}>
                                    {faceRecognitionResult.recognized ? " Wajah Terkenali!" : " Wajah Tidak Terkenali"}
                                </p>
                            </div>
                            {faceRecognitionResult.name && (
                                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    👤 <strong>{faceRecognitionResult.name}</strong> ({(faceRecognitionResult.confidence! * 100).toFixed(1)}%)
                                </p>
                            )}
                            <p className={`text-xs mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                {faceRecognitionResult.message}
                            </p>
                        </div>
                    )}

                    {/* PIN Fallback Input */}
                    {showPinInput && (
                        <div className={`mb-6 p-6 rounded-xl ${isDark ? "bg-orange-900/30 border border-orange-700" : "bg-orange-100 border border-orange-300"}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Lock className={`w-5 h-5 ${isDark ? "text-orange-400" : "text-orange-600"}`} />
                                <h4 className={`font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                                    Unlock dengan PIN
                                </h4>
                            </div>
                            <p className={`text-sm mb-4 ${isDark ? "text-orange-200" : "text-orange-800"}`}>
                                Wajah tidak dikenali. Masukkan PIN untuk membuka pintu.
                            </p>
                            <div className="flex gap-3">
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Masukkan PIN"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                                    className={`flex-1 px-4 py-2 rounded-lg border ${
                                        isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                            : "bg-white border-orange-300 text-slate-900 placeholder-slate-500"
                                    } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                />
                                <button
                                    onClick={handlePinUnlock}
                                    disabled={pinLoading || !pinCode.trim()}
                                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                        pinLoading || !pinCode.trim()
                                            ? isDark
                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                            : "bg-orange-600 hover:bg-orange-700 text-white"
                                    }`}
                                >
                                    {pinLoading ? "Verifikasi..." : "Buka"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Unlock Buttons */}
                    <div className="space-y-3">
                        {/* Manual Unlock Button */}
                        <button 
                            onClick={handleDoorUnlock}
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                                loading
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                            }`}
                        >
                            <Unlock className="w-6 h-6" />
                            {loading ? "Membuka..." : "Buka Pintu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

