// src/pages/dashboard/DevicesPage.tsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import "../../styles/dashboard.css";

interface DeviceState {
    lamp: string;
    curtain: string;
}

export default function DevicesPage(): JSX.Element {
    const [devices, setDevices] = useState<DeviceState>({
        lamp: "off",
        curtain: "closed",
    });
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchDeviceStatus();

        // WebSocket listeners
        const handleLampStatus = (data: any) => {
            setDevices(prev => ({ ...prev, lamp: data.status }));
        };

        const handleCurtainStatus = (data: any) => {
            setDevices(prev => ({ ...prev, curtain: data.status }));
        };

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
                axiosClient.get("/lamp/status"),
                axiosClient.get("/curtain/status"),
            ]);

            if (lampRes.data.success && lampRes.data.data) {
                setDevices(prev => ({ ...prev, lamp: lampRes.data.data.status }));
            }

            if (curtainRes.data.success && curtainRes.data.data) {
                setDevices(prev => ({ ...prev, curtain: curtainRes.data.data.status }));
            }
        } catch (err) {
            console.error("Failed to fetch device status:", err);
        }
    };

    const handleDeviceControl = async (device: string, action: string) => {
        setLoading(prev => ({ ...prev, [device]: true }));
        try {
            await axiosClient.post(`/${device}/control`, { action });
        } catch (err: any) {
            alert(err?.response?.data?.message || `Gagal mengontrol ${device}`);
        } finally {
            setLoading(prev => ({ ...prev, [device]: false }));
        }
    };

    return (
        <div className="devices-page">
            <div className="page-header">
                <h1>Kontrol Perangkat</h1>
                <p>Kontrol lampu, gorden, dan perangkat lainnya</p>
            </div>

            <div className="grid grid-2">
                {/* Lamp Control */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">💡 Lampu</h3>
                        <span className={`status-badge ${devices.lamp === "on" ? "active" : ""}`}>
                            {devices.lamp === "on" ? "Menyala" : "Mati"}
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                        <button 
                            className="btn btn-success" 
                            onClick={() => handleDeviceControl("lamp", "on")}
                            disabled={loading.lamp || devices.lamp === "on"}
                        >
                            Nyalakan
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => handleDeviceControl("lamp", "off")}
                            disabled={loading.lamp || devices.lamp === "off"}
                        >
                            Matikan
                        </button>
                    </div>
                </div>

                {/* Curtain Control */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">🪟 Gorden</h3>
                        <span className={`status-badge ${devices.curtain === "open" ? "active" : ""}`}>
                            {devices.curtain === "open" ? "Terbuka" : "Tertutup"}
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                        <button 
                            className="btn btn-success" 
                            onClick={() => handleDeviceControl("curtain", "open")}
                            disabled={loading.curtain || devices.curtain === "open"}
                        >
                            Buka
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => handleDeviceControl("curtain", "close")}
                            disabled={loading.curtain || devices.curtain === "closed"}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
