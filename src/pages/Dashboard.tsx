// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import SensorWidget from "../components/SensorWidget";
import useWebSocket from "../hooks/useWebSocket";

interface SensorData {
    temperature: number;
    humidity: number;
    light: number;
    gas_ppm: number;
}

export default function Dashboard(): JSX.Element {
    const [sensors, setSensors] = useState<SensorData>({
        temperature: 0,
        humidity: 0,
        light: 0,
        gas_ppm: 0
    });

    const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());

    const lastMessage = useWebSocket("ws://192.168.1.54:8080/api/ws");

    const fetchSensorData = () => {
        setIsRefreshing(true);

        Promise.all([
            fetch("http://192.168.1.54:8080/api/sensor/temperature").then((r) => r.ok ? r.json() : Promise.reject(r)),
            fetch("http://192.168.1.54:8080/api/sensor/humidity").then((r) => r.ok ? r.json() : Promise.reject(r)),
            fetch("http://192.168.1.54:8080/api/sensor/gas").then((r) => r.ok ? r.json() : Promise.reject(r)),
            fetch("http://192.168.1.54:8080/api/sensor/light").then((r) => r.ok ? r.json() : Promise.reject(r)),
        ])
            .then(([temp, humid, gas, light]: any) => {
                const t = temp?.data?.[0]?.temperature ?? temp.temperature ?? 0;
                const h = humid?.data?.[0]?.humidity ?? humid.humidity ?? 0;
                const g = gas?.data?.[0]?.ppm ?? gas.ppm ?? 0;
                const l = light?.data?.[0]?.lux ?? light.lux ?? 0;

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
        if (!lastMessage) return;

        let payload: any = null;
        try {
            payload = JSON.parse(lastMessage);
        } catch {
            return;
        }

        setLastUpdate(new Date().toLocaleTimeString());

        setSensors((prev) => ({
            temperature: payload.temperature ?? prev.temperature,
            humidity: payload.humidity ?? prev.humidity,
            gas_ppm: payload.gas_ppm ?? payload.ppm ?? prev.gas_ppm,
            light: payload.light ?? payload.lux ?? prev.light,
        }));
    }, [lastMessage]);

    return (
        <div className="min-h-screen p-6 bg-[#0c0c0d] text-gray-200">

            {/* TOP HEADER */}
            <div className="
                rounded-xl border border-gray-800 shadow-lg p-6 mb-6
                bg-[#141416] bg-opacity-70 backdrop-blur-md
            ">
                <div className="flex flex-col md:flex-row justify-between items-center">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-100 tracking-tight drop-shadow">
                            IoT Smart Home Dashboard
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Real-time monitoring of sensor data
                        </p>
                    </div>

                    <div className="text-right mt-4 md:mt-0">
                        <div className="flex items-center justify-end gap-2">
                            <span
                                className={`
                                    h-3 w-3 rounded-full animate-pulse
                                    ${connectionStatus === "Connected" ? "bg-green-400 shadow-green-500/50 shadow" : "bg-red-500 shadow-red-500/50 shadow"}
                                `}
                            ></span>

                            <span className="text-sm font-medium text-gray-300">
                                {connectionStatus}
                            </span>
                        </div>

                        {isRefreshing && (
                            <p className="text-xs text-blue-400 mt-1">Refreshing...</p>
                        )}

                        <p className="text-xs text-gray-500 mt-1">
                            Last update: {lastUpdate}
                        </p>
                    </div>

                </div>
            </div>

            {/* SENSOR GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SensorWidget
                    title="Temperature"
                    value={sensors.temperature}
                    unit="°C"
                    color="red"
                    icon={<i className="fas fa-temperature-high" />}
                />

                <SensorWidget
                    title="Humidity"
                    value={sensors.humidity}
                    unit="%"
                    color="blue"
                    icon={<i className="fas fa-tint" />}
                />

                <SensorWidget
                    title="Light (LDR)"
                    value={sensors.light}
                    unit="lux"
                    color="yellow"
                    icon={<i className="fas fa-sun" />}
                />

                <SensorWidget
                    title="Gas Sensor"
                    value={Number(sensors.gas_ppm).toFixed(2)}
                    unit="ppm"
                    color="purple"
                    icon={<i className="fas fa-cloud" />}
                />
            </div>

            {/* INFO SECTION */}
            <div
                className="
                    mt-8 p-6 rounded-xl border border-gray-800 shadow-md
                    bg-[#141416] bg-opacity-70 backdrop-blur-md
                "
            >
                <h3 className="text-lg font-semibold text-gray-100 mb-4">
                    Sensor Description
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-gray-200">DHT22 Sensor</p>
                        <p className="text-gray-500">Temperature & Humidity</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-200">LDR Sensor</p>
                        <p className="text-gray-500">Light Intensity</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-200">MQ-2 Gas Sensor</p>
                        <p className="text-gray-500">Air Quality (ppm)</p>
                    </div>
                </div>

                <div className="mt-5 border-t border-gray-700 pt-4 text-xs text-gray-500">
                    Auto-refresh every 5 seconds • WebSocket: ws://192.168.1.54:8080/api/ws
                </div>
            </div>
        </div>
    );
}
