// src/pages/dashboard/Home.tsx
import React, { useEffect, useState } from "react";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import "../../styles/dashboard.css";

interface SensorData {
    temperature?: number;
    humidity?: number;
    gas?: number;
    light?: number;
}

interface DeviceStatus {
    door?: string;
    lamp?: string;
    curtain?: string;
}

export default function Home(): JSX.Element {
    const [sensors, setSensors] = useState<SensorData>({});
    const [devices, setDevices] = useState<DeviceStatus>({});
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        // Handler untuk sensor data
        const handleTemperature = (data: any) => {
            setSensors(prev => ({ ...prev, temperature: data.value }));
            setLastUpdate(new Date());
        };

        const handleHumidity = (data: any) => {
            setSensors(prev => ({ ...prev, humidity: data.value }));
            setLastUpdate(new Date());
        };

        const handleGas = (data: any) => {
            setSensors(prev => ({ ...prev, gas: data.value }));
            setLastUpdate(new Date());
        };

        const handleLight = (data: any) => {
            setSensors(prev => ({ ...prev, light: data.value }));
            setLastUpdate(new Date());
        };

        // Handler untuk device status
        const handleDoorStatus = (data: any) => {
            setDevices(prev => ({ ...prev, door: data.status }));
            setLastUpdate(new Date());
        };

        const handleLampStatus = (data: any) => {
            setDevices(prev => ({ ...prev, lamp: data.status }));
            setLastUpdate(new Date());
        };

        const handleCurtainStatus = (data: any) => {
            setDevices(prev => ({ ...prev, curtain: data.status }));
            setLastUpdate(new Date());
        };

        // Subscribe ke WebSocket events
        websocketService.on(WS_TYPES.TEMPERATURE, handleTemperature);
        websocketService.on(WS_TYPES.HUMIDITY, handleHumidity);
        websocketService.on(WS_TYPES.GAS, handleGas);
        websocketService.on(WS_TYPES.LIGHT, handleLight);
        websocketService.on(WS_TYPES.DOOR_STATUS, handleDoorStatus);
        websocketService.on(WS_TYPES.LAMP_STATUS, handleLampStatus);
        websocketService.on(WS_TYPES.CURTAIN_STATUS, handleCurtainStatus);

        // Cleanup saat unmount
        return () => {
            websocketService.off(WS_TYPES.TEMPERATURE, handleTemperature);
            websocketService.off(WS_TYPES.HUMIDITY, handleHumidity);
            websocketService.off(WS_TYPES.GAS, handleGas);
            websocketService.off(WS_TYPES.LIGHT, handleLight);
            websocketService.off(WS_TYPES.DOOR_STATUS, handleDoorStatus);
            websocketService.off(WS_TYPES.LAMP_STATUS, handleLampStatus);
            websocketService.off(WS_TYPES.CURTAIN_STATUS, handleCurtainStatus);
        };
    }, []);

    return (
        <div className="home-page">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview sistem smart home IoT</p>
            </div>

            {/* Sensor Cards */}
            <div className="grid grid-4">
                <div className="stat-card">
                    <div className="stat-icon">🌡️</div>
                    <div className="stat-label">Suhu</div>
                    <div className="stat-value">
                        {sensors.temperature !== undefined 
                            ? `${sensors.temperature}°C` 
                            : "--"}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💧</div>
                    <div className="stat-label">Kelembaban</div>
                    <div className="stat-value">
                        {sensors.humidity !== undefined 
                            ? `${sensors.humidity}%` 
                            : "--"}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💨</div>
                    <div className="stat-label">Gas</div>
                    <div className="stat-value">
                        {sensors.gas !== undefined 
                            ? sensors.gas 
                            : "--"}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">☀️</div>
                    <div className="stat-label">Cahaya</div>
                    <div className="stat-value">
                        {sensors.light !== undefined 
                            ? sensors.light 
                            : "--"}
                    </div>
                </div>
            </div>

            {/* Device Status */}
            <div className="grid grid-3" style={{ marginTop: "24px" }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">🚪 Pintu</h3>
                        <span className={`status-badge ${devices.door === "closed" ? "closed" : "open"}`}>
                            {devices.door === "closed" ? "Tertutup" : devices.door === "open" ? "Terbuka" : "--"}
                        </span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">💡 Lampu</h3>
                        <span className={`status-badge ${devices.lamp === "on" ? "active" : ""}`}>
                            {devices.lamp === "on" ? "Menyala" : devices.lamp === "off" ? "Mati" : "--"}
                        </span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">🪟 Gorden</h3>
                        <span className={`status-badge ${devices.curtain === "open" ? "active" : ""}`}>
                            {devices.curtain === "open" ? "Terbuka" : devices.curtain === "closed" ? "Tertutup" : "--"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Last Update */}
            <div style={{ marginTop: "24px", textAlign: "center", color: "#718096", fontSize: "14px" }}>
                Update terakhir: {lastUpdate.toLocaleTimeString("id-ID")}
            </div>
        </div>
    );
}
