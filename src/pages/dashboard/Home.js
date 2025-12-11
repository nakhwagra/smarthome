var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import axiosClient from "../../api/axiosClient";
import { Thermometer, Droplets, Wind, Sun, Lightbulb, Lock } from "lucide-react";
export default function Home() {
    const [sensors, setSensors] = useState({
        temperature: 0,
        humidity: 0,
        gas: 0,
        light: 0,
    });
    const [devices, setDevices] = useState({
        lamp: false,
        door: false,
    });
    useEffect(() => {
        // Fetch initial data
        fetchInitialData();
        // WebSocket listeners
        const handleTemperature = (data) => {
            setSensors(prev => (Object.assign(Object.assign({}, prev), { temperature: data.value })));
        };
        const handleHumidity = (data) => {
            setSensors(prev => (Object.assign(Object.assign({}, prev), { humidity: data.value })));
        };
        const handleGas = (data) => {
            setSensors(prev => (Object.assign(Object.assign({}, prev), { gas: data.value })));
        };
        const handleLight = (data) => {
            setSensors(prev => (Object.assign(Object.assign({}, prev), { light: data.value })));
        };
        const handleLampStatus = (data) => {
            setDevices(prev => (Object.assign(Object.assign({}, prev), { lamp: data.status === "on" })));
        };
        const handleDoorStatus = (data) => {
            setDevices(prev => (Object.assign(Object.assign({}, prev), { door: data.status === "locked" })));
        };
        websocketService.on(WS_TYPES.TEMPERATURE, handleTemperature);
        websocketService.on(WS_TYPES.HUMIDITY, handleHumidity);
        websocketService.on(WS_TYPES.GAS, handleGas);
        websocketService.on(WS_TYPES.LIGHT, handleLight);
        websocketService.on(WS_TYPES.LAMP_STATUS, handleLampStatus);
        websocketService.on(WS_TYPES.DOOR_STATUS, handleDoorStatus);
        return () => {
            websocketService.off(WS_TYPES.TEMPERATURE, handleTemperature);
            websocketService.off(WS_TYPES.HUMIDITY, handleHumidity);
            websocketService.off(WS_TYPES.GAS, handleGas);
            websocketService.off(WS_TYPES.LIGHT, handleLight);
            websocketService.off(WS_TYPES.LAMP_STATUS, handleLampStatus);
            websocketService.off(WS_TYPES.DOOR_STATUS, handleDoorStatus);
        };
    }, []);
    const fetchInitialData = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const [tempRes, humidRes, gasRes, lightRes, lampRes, doorRes] = yield Promise.all([
                axiosClient.get("/sensor/temperature"),
                axiosClient.get("/sensor/humidity"),
                axiosClient.get("/sensor/gas"),
                axiosClient.get("/sensor/light"),
                axiosClient.get("/device/lamp/latest"),
                axiosClient.get("/device/door/latest"),
            ]);
            if ((_a = tempRes.data.data) === null || _a === void 0 ? void 0 : _a[0])
                setSensors(prev => (Object.assign(Object.assign({}, prev), { temperature: tempRes.data.data[0].temperature })));
            if ((_b = humidRes.data.data) === null || _b === void 0 ? void 0 : _b[0])
                setSensors(prev => (Object.assign(Object.assign({}, prev), { humidity: humidRes.data.data[0].humidity })));
            if ((_c = gasRes.data.data) === null || _c === void 0 ? void 0 : _c[0])
                setSensors(prev => (Object.assign(Object.assign({}, prev), { gas: gasRes.data.data[0].ppm })));
            if ((_d = lightRes.data.data) === null || _d === void 0 ? void 0 : _d[0])
                setSensors(prev => (Object.assign(Object.assign({}, prev), { light: lightRes.data.data[0].lux })));
            console.log("💡 Lamp Response:", lampRes.data);
            console.log("🚪 Door Response:", doorRes.data);
            if (lampRes.data.data) {
                const lampOn = lampRes.data.data.status === "on";
                console.log("Setting lamp to:", lampOn, "(status:", lampRes.data.data.status, ")");
                setDevices(prev => (Object.assign(Object.assign({}, prev), { lamp: lampOn })));
            }
            if (doorRes.data.data) {
                const doorLocked = doorRes.data.data.status === "locked";
                console.log("Setting door to:", doorLocked, "(status:", doorRes.data.data.status, ")");
                setDevices(prev => (Object.assign(Object.assign({}, prev), { door: doorLocked })));
            }
        }
        catch (err) {
            console.error("Failed to fetch initial data:", err);
        }
    });
    const StatCard = ({ icon: Icon, label, value, unit, color }) => (_jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400", children: label }), _jsx("div", { className: `p-3 rounded-xl ${color}`, children: _jsx(Icon, { size: 24, className: "text-white" }) })] }), _jsxs("p", { className: "text-3xl font-bold text-slate-900 dark:text-white", children: [typeof value === "number" ? value.toFixed(1) : value, _jsx("span", { className: "text-sm text-slate-500 dark:text-slate-400 ml-2", children: unit })] }), _jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-2", children: ["Updated: ", new Date().toLocaleTimeString()] })] }));
    const DeviceCard = ({ icon: Icon, label, status, statusLabel }) => (_jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-sm text-slate-600 dark:text-slate-400", children: label }), _jsx("div", { className: `p-3 rounded-xl ${status ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`, children: _jsx(Icon, { size: 24, className: status ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400" }) })] }), _jsx("p", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: statusLabel }), _jsx("div", { className: `mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold ${status
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`, children: status ? "Active" : "Inactive" })] }));
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("section", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-4", children: "Environmental Sensors" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(StatCard, { icon: Thermometer, label: "Temperature", value: sensors.temperature, unit: "\u00B0C", color: "bg-red-500" }), _jsx(StatCard, { icon: Droplets, label: "Humidity", value: sensors.humidity, unit: "%", color: "bg-blue-500" }), _jsx(StatCard, { icon: Wind, label: "Gas Level", value: sensors.gas, unit: "PPM", color: "bg-orange-500" }), _jsx(StatCard, { icon: Sun, label: "Light Level", value: sensors.light, unit: "LUX", color: "bg-yellow-500" })] })] }), _jsxs("section", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white mb-4", children: "Device Status" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(DeviceCard, { icon: Lightbulb, label: "Lamp", status: devices.lamp, statusLabel: devices.lamp ? "ON" : "OFF" }), _jsx(DeviceCard, { icon: Lock, label: "Door", status: devices.door, statusLabel: devices.door ? "LOCKED" : "UNLOCKED" })] })] })] }));
}
