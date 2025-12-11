import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/dashboard/Home.tsx
import { useEffect, useState } from "react";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import "../../styles/dashboard.css";
export default function Home() {
    const [sensors, setSensors] = useState({});
    const [devices, setDevices] = useState({});
    const [lastUpdate, setLastUpdate] = useState(new Date());
    useEffect(() => {
        // Handler untuk sensor data
        const handleTemperature = (data) => {
            setSensors(prev => (Object.assign(Object.assign({}, prev), { temperature: data.value })));
            setLastUpdate(new Date());
        };
        const handleHumidity = (data) => {
            setSensors(prev => (Object.assign(Object.assign({}, prev), { humidity: data.value })));
            setLastUpdate(new Date());
        };
        const handleGas = (data) => {
            setSensors(prev => (Object.assign(Object.assign({}, prev), { gas: data.value })));
            setLastUpdate(new Date());
        };
        const handleLight = (data) => {
            setSensors(prev => (Object.assign(Object.assign({}, prev), { light: data.value })));
            setLastUpdate(new Date());
        };
        // Handler untuk device status
        const handleDoorStatus = (data) => {
            setDevices(prev => (Object.assign(Object.assign({}, prev), { door: data.status })));
            setLastUpdate(new Date());
        };
        const handleLampStatus = (data) => {
            setDevices(prev => (Object.assign(Object.assign({}, prev), { lamp: data.status })));
            setLastUpdate(new Date());
        };
        const handleCurtainStatus = (data) => {
            setDevices(prev => (Object.assign(Object.assign({}, prev), { curtain: data.status })));
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
    return (_jsxs("div", { className: "home-page", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "Dashboard" }), _jsx("p", { children: "Overview sistem smart home IoT" })] }), _jsxs("div", { className: "grid grid-4", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: "\uD83C\uDF21\uFE0F" }), _jsx("div", { className: "stat-label", children: "Suhu" }), _jsx("div", { className: "stat-value", children: sensors.temperature !== undefined
                                    ? `${sensors.temperature}°C`
                                    : "--" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCA7" }), _jsx("div", { className: "stat-label", children: "Kelembaban" }), _jsx("div", { className: "stat-value", children: sensors.humidity !== undefined
                                    ? `${sensors.humidity}%`
                                    : "--" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCA8" }), _jsx("div", { className: "stat-label", children: "Gas" }), _jsx("div", { className: "stat-value", children: sensors.gas !== undefined
                                    ? sensors.gas
                                    : "--" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: "\u2600\uFE0F" }), _jsx("div", { className: "stat-label", children: "Cahaya" }), _jsx("div", { className: "stat-value", children: sensors.light !== undefined
                                    ? sensors.light
                                    : "--" })] })] }), _jsxs("div", { className: "grid grid-3", style: { marginTop: "24px" }, children: [_jsx("div", { className: "card", children: _jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "card-title", children: "\uD83D\uDEAA Pintu" }), _jsx("span", { className: `status-badge ${devices.door === "closed" ? "closed" : "open"}`, children: devices.door === "closed" ? "Tertutup" : devices.door === "open" ? "Terbuka" : "--" })] }) }), _jsx("div", { className: "card", children: _jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "card-title", children: "\uD83D\uDCA1 Lampu" }), _jsx("span", { className: `status-badge ${devices.lamp === "on" ? "active" : ""}`, children: devices.lamp === "on" ? "Menyala" : devices.lamp === "off" ? "Mati" : "--" })] }) }), _jsx("div", { className: "card", children: _jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "card-title", children: "\uD83E\uDE9F Gorden" }), _jsx("span", { className: `status-badge ${devices.curtain === "open" ? "active" : ""}`, children: devices.curtain === "open" ? "Terbuka" : devices.curtain === "closed" ? "Tertutup" : "--" })] }) })] }), _jsxs("div", { style: { marginTop: "24px", textAlign: "center", color: "#718096", fontSize: "14px" }, children: ["Update terakhir: ", lastUpdate.toLocaleTimeString("id-ID")] })] }));
}
