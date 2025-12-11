import React, { useEffect, useState } from "react";
import { Lightbulb, Wind, Power, Activity } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import { useTheme } from "../../context/ThemeContext";

interface DeviceState {
    lamp: string;
    curtain: string;
}

interface DeviceMode {
    lamp: "manual" | "auto";
    curtain: "manual" | "auto";
}

export default function DevicesPage(): JSX.Element {
    const [devices, setDevices] = useState<DeviceState>({ lamp: "off", curtain: "closed" });
    const [modes, setModes] = useState<DeviceMode>({ lamp: "manual", curtain: "manual" });
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const { isDark } = useTheme();

    useEffect(() => {
        fetchDeviceStatus();

        const handleLampStatus = (data: { status: string }) => setDevices(prev => ({ ...prev, lamp: data.status }));
        const handleCurtainStatus = (data: { status: string }) => setDevices(prev => ({ ...prev, curtain: data.status }));

        websocketService.on(WS_TYPES.LAMP_STATUS, handleLampStatus);
        websocketService.on(WS_TYPES.CURTAIN_STATUS, handleCurtainStatus);

        return () => {
            websocketService.off(WS_TYPES.LAMP_STATUS, handleLampStatus);
            websocketService.off(WS_TYPES.CURTAIN_STATUS, handleCurtainStatus);
        };
    }, []);

    const fetchDeviceStatus = async () => {
        try {
            const [lampRes, curtainRes] = await Promise.all([
                axiosClient.get("/device/lamp/latest").catch(() => ({ data: { success: false, data: null } })),
                axiosClient.get("/device/curtain/latest").catch(() => ({ data: { success: false, data: null } })),
            ]);

            if (lampRes.data.success && lampRes.data.data) {
                setDevices(prev => ({ ...prev, lamp: lampRes.data.data.status }));
                if (lampRes.data.data.mode) setModes(prev => ({ ...prev, lamp: lampRes.data.data.mode }));
            }

            if (curtainRes.data.success && curtainRes.data.data) {
                setDevices(prev => ({ ...prev, curtain: curtainRes.data.data.status }));
                if (curtainRes.data.data.mode) setModes(prev => ({ ...prev, curtain: curtainRes.data.data.mode }));
            }
        } catch (err) {
            console.error("Failed to fetch device status:", err);
        }
    };

    const handleDeviceControl = async (device: keyof DeviceMode, action: string, position?: number) => {
        setLoading(prev => ({ ...prev, [device]: true }));
        try {
            const payload: { action: string; mode: string; position?: number } = {
                action,
                mode: modes[device],
            };
            if (device === "curtain" && position !== undefined) payload.position = position;
            await axiosClient.post(`/control/${device}`, payload);
            
            // Optimistic update: langsung update UI tanpa tunggu WebSocket
            if (device === "lamp") {
                setDevices(prev => ({ ...prev, lamp: action }));
            } else if (device === "curtain") {
                setDevices(prev => ({ ...prev, curtain: action === "open" ? "open" : "closed" }));
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr?.response?.data?.message || `Gagal mengontrol ${device}`);
        } finally {
            setLoading(prev => ({ ...prev, [device]: false }));
        }
    };

    const syncMode = async (device: keyof DeviceMode) => {
        const newMode: "manual" | "auto" = modes[device] === "manual" ? "auto" : "manual";
        const currentStatus = device === "lamp" ? devices.lamp : devices.curtain;
        const action = device === "lamp" ? (currentStatus === "on" ? "on" : "off") : currentStatus === "open" ? "open" : "close";

        setLoading(prev => ({ ...prev, [`mode-${device}`]: true }));
        try {
            await axiosClient.post(`/control/${device}`, { action, mode: newMode });
            setModes(prev => ({ ...prev, [device]: newMode }));
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr?.response?.data?.message || `Gagal mengubah mode ${device}`);
        } finally {
            setLoading(prev => ({ ...prev, [`mode-${device}`]: false }));
        }
    };

    const isLampOn = devices.lamp === "on";
    const isCurtainOpen = devices.curtain === "open";

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Kontrol Perangkat
                </h1>
                <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Kontrol lampu, gorden, dan perangkat lainnya
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lamp card */}
                <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${isDark ? "bg-yellow-900/30" : "bg-yellow-100"}`}>
                            <Lightbulb className={`w-8 h-8 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                Lampu
                            </h3>
                            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                Kontrol pencahayaan ruangan
                            </p>
                        </div>
                    </div>

                    <div className={`flex items-center justify-between mb-6 p-4 rounded-lg ${
                        isLampOn ? "bg-yellow-100 dark:bg-yellow-900/30" : isDark ? "bg-slate-700" : "bg-slate-100"
                    }`}>
                        <span className={`font-semibold ${
                            isLampOn ? "text-yellow-700 dark:text-yellow-300" : isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                            {isLampOn ? "Menyala" : "Mati"}
                        </span>
                        <Power className={`w-5 h-5 ${
                            isLampOn ? "text-yellow-600 dark:text-yellow-400" : isDark ? "text-slate-400" : "text-slate-500"
                        }`} />
                    </div>

                    <div className="mb-4">
                        <label className={`text-sm font-medium mb-2 block ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            Mode Kontrol
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => syncMode("lamp")}
                                disabled={!!loading["mode-lamp"]}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                    modes.lamp === "manual"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                } ${loading["mode-lamp"] ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                Manual
                            </button>
                            <button
                                onClick={() => syncMode("lamp")}
                                disabled={!!loading["mode-lamp"]}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                    modes.lamp === "auto"
                                        ? "bg-green-600 text-white shadow-md"
                                        : isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                } ${loading["mode-lamp"] ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                Otomatis
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleDeviceControl("lamp", "on")}
                            disabled={loading.lamp || isLampOn}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                                loading.lamp || isLampOn
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl"
                            }`}
                        >
                            Nyalakan
                        </button>
                        <button
                            onClick={() => handleDeviceControl("lamp", "off")}
                            disabled={loading.lamp || !isLampOn}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                                loading.lamp || !isLampOn
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl"
                            }`}
                        >
                            Matikan
                        </button>
                    </div>
                </div>

                {/* Curtain card */}
                <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${isDark ? "bg-blue-900/30" : "bg-blue-100"}`}>
                            <Wind className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                Gorden
                            </h3>
                            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                Kontrol pembukaan gorden
                            </p>
                        </div>
                    </div>

                    <div className={`flex items-center justify-between mb-6 p-4 rounded-lg ${
                        isCurtainOpen ? "bg-blue-100 dark:bg-blue-900/30" : isDark ? "bg-slate-700" : "bg-slate-100"
                    }`}>
                        <span className={`font-semibold ${
                            isCurtainOpen ? "text-blue-700 dark:text-blue-300" : isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                            {isCurtainOpen ? "Terbuka" : "Tertutup"}
                        </span>
                        <Wind className={`w-5 h-5 ${
                            isCurtainOpen ? "text-blue-600 dark:text-blue-400" : isDark ? "text-slate-400" : "text-slate-500"
                        }`} />
                    </div>

                    <div className="mb-4">
                        <label className={`text-sm font-medium mb-2 block ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            Mode Kontrol
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => syncMode("curtain")}
                                disabled={!!loading["mode-curtain"]}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                    modes.curtain === "manual"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                } ${loading["mode-curtain"] ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                Manual
                            </button>
                            <button
                                onClick={() => syncMode("curtain")}
                                disabled={!!loading["mode-curtain"]}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                                    modes.curtain === "auto"
                                        ? "bg-green-600 text-white shadow-md"
                                        : isDark
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                } ${loading["mode-curtain"] ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                Otomatis
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleDeviceControl("curtain", "open")}
                            disabled={loading.curtain || isCurtainOpen}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                                loading.curtain || isCurtainOpen
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                            }`}
                        >
                            Buka
                        </button>
                        <button
                            onClick={() => handleDeviceControl("curtain", "close")}
                            disabled={loading.curtain || !isCurtainOpen}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                                loading.curtain || !isCurtainOpen
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-600 hover:bg-slate-700 text-white shadow-lg hover:shadow-xl"
                            }`}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>

            <div className={`mt-6 flex items-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                <Activity className="w-4 h-4" />
                <span>Mode otomatis mengikuti sensor cahaya (threshold 300 lux, debounce 5 detik). Set ke manual untuk mengabaikan sensor.</span>
            </div>
        </div>
    );
}
