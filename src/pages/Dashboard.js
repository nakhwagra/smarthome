import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import SensorWidget from "../components/SensorWidget";
import useWebSocket from "../hooks/useWebSocket";
export default function Dashboard() {
    const [sensors, setSensors] = useState({
        temperature: 0,
        humidity: 0,
        light: 0,
        gas_ppm: 0
    });
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
    const lastMessage = useWebSocket("ws://192.168.1.54:8080/api/ws");
    const fetchSensorData = () => {
        setIsRefreshing(true);
        Promise.all([
            fetch("http://192.168.1.54:8080/api/sensor/temperature").then((r) => r.ok ? r.json() : Promise.reject(r)),
            fetch("http://192.168.1.54:8080/api/sensor/humidity").then((r) => r.ok ? r.json() : Promise.reject(r)),
            fetch("http://192.168.1.54:8080/api/sensor/gas").then((r) => r.ok ? r.json() : Promise.reject(r)),
            fetch("http://192.168.1.54:8080/api/sensor/light").then((r) => r.ok ? r.json() : Promise.reject(r)),
        ])
            .then(([temp, humid, gas, light]) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            const t = (_d = (_c = (_b = (_a = temp === null || temp === void 0 ? void 0 : temp.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.temperature) !== null && _c !== void 0 ? _c : temp.temperature) !== null && _d !== void 0 ? _d : 0;
            const h = (_h = (_g = (_f = (_e = humid === null || humid === void 0 ? void 0 : humid.data) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.humidity) !== null && _g !== void 0 ? _g : humid.humidity) !== null && _h !== void 0 ? _h : 0;
            const g = (_m = (_l = (_k = (_j = gas === null || gas === void 0 ? void 0 : gas.data) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.ppm) !== null && _l !== void 0 ? _l : gas.ppm) !== null && _m !== void 0 ? _m : 0;
            const l = (_r = (_q = (_p = (_o = light === null || light === void 0 ? void 0 : light.data) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.lux) !== null && _q !== void 0 ? _q : light.lux) !== null && _r !== void 0 ? _r : 0;
            setSensors({
                temperature: Number(t),
                humidity: Number(h),
                gas_ppm: Number(g),
                light: Number(l),
            });
            setConnectionStatus("Connected");
        })
            .catch(() => setConnectionStatus("Connection failed"))
            .finally(() => {
            setIsRefreshing(false);
            setLastUpdate(new Date().toLocaleTimeString());
        });
    };
    useEffect(() => {
        fetchSensorData();
        const interval = setInterval(fetchSensorData, 5000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        if (!lastMessage)
            return;
        let payload = null;
        try {
            payload = JSON.parse(lastMessage);
        }
        catch (_a) {
            return;
        }
        setLastUpdate(new Date().toLocaleTimeString());
        setSensors((prev) => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                temperature: (_a = payload.temperature) !== null && _a !== void 0 ? _a : prev.temperature,
                humidity: (_b = payload.humidity) !== null && _b !== void 0 ? _b : prev.humidity,
                gas_ppm: (_d = (_c = payload.gas_ppm) !== null && _c !== void 0 ? _c : payload.ppm) !== null && _d !== void 0 ? _d : prev.gas_ppm,
                light: (_f = (_e = payload.light) !== null && _e !== void 0 ? _e : payload.lux) !== null && _f !== void 0 ? _f : prev.light,
            });
        });
    }, [lastMessage]);
    return (_jsxs("div", { className: "min-h-screen p-6 bg-[#0c0c0d] text-gray-200", children: [_jsx("div", { className: "\r\n                rounded-xl border border-gray-800 shadow-lg p-6 mb-6\r\n                bg-[#141416] bg-opacity-70 backdrop-blur-md\r\n            ", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-100 tracking-tight drop-shadow", children: "IoT Smart Home Dashboard" }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Real-time monitoring of sensor data" })] }), _jsxs("div", { className: "text-right mt-4 md:mt-0", children: [_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("span", { className: `
                                    h-3 w-3 rounded-full animate-pulse
                                    ${connectionStatus === "Connected" ? "bg-green-400 shadow-green-500/50 shadow" : "bg-red-500 shadow-red-500/50 shadow"}
                                ` }), _jsx("span", { className: "text-sm font-medium text-gray-300", children: connectionStatus })] }), isRefreshing && (_jsx("p", { className: "text-xs text-blue-400 mt-1", children: "Refreshing..." })), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Last update: ", lastUpdate] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(SensorWidget, { title: "Temperature", value: sensors.temperature, unit: "\u00B0C", color: "red", icon: _jsx("i", { className: "fas fa-temperature-high" }) }), _jsx(SensorWidget, { title: "Humidity", value: sensors.humidity, unit: "%", color: "blue", icon: _jsx("i", { className: "fas fa-tint" }) }), _jsx(SensorWidget, { title: "Light (LDR)", value: sensors.light, unit: "lux", color: "yellow", icon: _jsx("i", { className: "fas fa-sun" }) }), _jsx(SensorWidget, { title: "Gas Sensor", value: Number(sensors.gas_ppm).toFixed(2), unit: "ppm", color: "purple", icon: _jsx("i", { className: "fas fa-cloud" }) })] }), _jsxs("div", { className: "\r\n                    mt-8 p-6 rounded-xl border border-gray-800 shadow-md\r\n                    bg-[#141416] bg-opacity-70 backdrop-blur-md\r\n                ", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-100 mb-4", children: "Sensor Description" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-200", children: "DHT22 Sensor" }), _jsx("p", { className: "text-gray-500", children: "Temperature & Humidity" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-200", children: "LDR Sensor" }), _jsx("p", { className: "text-gray-500", children: "Light Intensity" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-200", children: "MQ-2 Gas Sensor" }), _jsx("p", { className: "text-gray-500", children: "Air Quality (ppm)" })] })] }), _jsx("div", { className: "mt-5 border-t border-gray-700 pt-4 text-xs text-gray-500", children: "Auto-refresh every 5 seconds \u2022 WebSocket: ws://192.168.1.54:8080/api/ws" })] })] }));
}
