import React, { useEffect, useState } from "react";
import SensorWidget from "../components/SensorWidget";
import axiosClient from "../api/axiosClient";

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
        gas_ppm: 0,
    });
    const [connectionStatus, setConnectionStatus] = useState("Connecting...");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState("-");

    const fetchSensorData = async () => {
        setIsRefreshing(true);
        try {
            const res = await axiosClient.get("/dashboard/initial");
            const sensorData = res.data?.data?.sensors;
            if (sensorData) {
                setSensors({
                    temperature: Number(sensorData.temperature ?? 0),
                    humidity: Number(sensorData.humidity ?? 0),
                    light: Number(sensorData.light ?? 0),
                    gas_ppm: Number(sensorData.gas ?? sensorData.gas_ppm ?? 0),
                });
                setConnectionStatus("Connected");
                setLastUpdate(new Date().toLocaleTimeString());
                return;
            }
            throw new Error("Invalid dashboard response");
        } catch {
            // Fallback ke endpoint terpisah jika aggregated tidak ada
            try {
                const [tempRes, humidRes, gasRes, lightRes] = await Promise.all([
                    axiosClient.get("/sensor/temperature"),
                    axiosClient.get("/sensor/humidity"),
                    axiosClient.get("/sensor/gas"),
                    axiosClient.get("/sensor/light"),
                ]);

                const latestTemp = tempRes.data?.data?.[0]?.temperature ?? 0;
                const latestHumid = humidRes.data?.data?.[0]?.humidity ?? 0;
                const latestGasRaw = gasRes.data?.data?.[0] ?? {};
                const latestGas = latestGasRaw.ppm_value ?? latestGasRaw.ppm ?? 0;
                const latestLight = lightRes.data?.data?.[0]?.lux ?? lightRes.data?.data?.[0]?.light ?? 0;

                setSensors({
                    temperature: Number(latestTemp),
                    humidity: Number(latestHumid),
                    light: Number(latestLight),
                    gas_ppm: Number(latestGas),
                });
                setConnectionStatus("Connected");
                setLastUpdate(new Date().toLocaleTimeString());
            } catch {
                setConnectionStatus("Connection failed");
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSensorData();
        const interval = setInterval(fetchSensorData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen p-6 bg-[#0c0c0d] text-gray-200">

            {/* TOP HEADER */}
            <div className="
                rounded-xl border border-gray-800 shadow-lg p-6 mb-6
                bg-[#141416] bg-opacity-70 backdrop-blur-md
            ">
                <div className="flex flex-col items-center justify-between md:flex-row">

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-100 drop-shadow">
                            IoT Smart Home Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-400">
                            Monitoring sensor melalui REST API
                        </p>
                    </div>

                    <div className="mt-4 text-right md:mt-0">
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
                            <p className="mt-1 text-xs text-blue-400">Refreshing...</p>
                        )}

                        <p className="mt-1 text-xs text-gray-500">
                            Last update: {lastUpdate}
                        </p>
                    </div>

                </div>
            </div>

            {/* SENSOR GRID */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <h3 className="mb-4 text-lg font-semibold text-gray-100">
                    Sensor Description
                </h3>

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
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

                <div className="pt-4 mt-5 text-xs text-gray-500 border-t border-gray-700">
                    Auto-refresh every 5 seconds via REST API
                </div>
            </div>
        </div>
    );
}
