import { useEffect, useState } from "react";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import axiosClient from "../../api/axiosClient";
import { Thermometer, Droplets, Wind, Sun, Lightbulb, Lock } from "lucide-react";

interface SensorData {
  temperature: number;
  humidity: number;
  gas: number;
  light: number;
  updatedAt?: string;
}

interface DeviceStatus {
  lamp: boolean;
  door: boolean;
}

export default function Home(): JSX.Element {
  const [sensors, setSensors] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    gas: 0,
    light: 0,
  });
  const [devices, setDevices] = useState<DeviceStatus>({
    lamp: false,
    door: false,
  });

  useEffect(() => {
    // Fetch initial data
    fetchInitialData();

    // WebSocket listeners
    const handleTemperature = (data: { value: number }) => {
      setSensors(prev => ({ ...prev, temperature: data.value }));
    };

    const handleHumidity = (data: { value: number }) => {
      setSensors(prev => ({ ...prev, humidity: data.value }));
    };

    const handleGas = (data: { value: number }) => {
      setSensors(prev => ({ ...prev, gas: data.value }));
    };

    const handleLight = (data: { value: number }) => {
      setSensors(prev => ({ ...prev, light: data.value }));
    };

    const handleLampStatus = (data: { status: string }) => {
      setDevices(prev => ({ ...prev, lamp: data.status === "on" }));
    };

    const handleDoorStatus = (data: { status: string }) => {
      setDevices(prev => ({ ...prev, door: data.status === "locked" }));
    };

    websocketService.on<{ value: number }>(WS_TYPES.TEMPERATURE, handleTemperature);
    websocketService.on<{ value: number }>(WS_TYPES.HUMIDITY, handleHumidity);
    websocketService.on<{ value: number }>(WS_TYPES.GAS, handleGas);
    websocketService.on<{ value: number }>(WS_TYPES.LIGHT, handleLight);
    websocketService.on<{ status: string }>(WS_TYPES.LAMP_STATUS, handleLampStatus);
    websocketService.on<{ status: string }>(WS_TYPES.DOOR_STATUS, handleDoorStatus);

    return () => {
      websocketService.off(WS_TYPES.TEMPERATURE, handleTemperature);
      websocketService.off(WS_TYPES.HUMIDITY, handleHumidity);
      websocketService.off(WS_TYPES.GAS, handleGas);
      websocketService.off(WS_TYPES.LIGHT, handleLight);
      websocketService.off(WS_TYPES.LAMP_STATUS, handleLampStatus);
      websocketService.off(WS_TYPES.DOOR_STATUS, handleDoorStatus);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [tempRes, humidRes, gasRes, lightRes, lampRes, doorRes] = await Promise.all([
        axiosClient.get("/sensor/temperature"),
        axiosClient.get("/sensor/humidity"),
        axiosClient.get("/sensor/gas"),
        axiosClient.get("/sensor/light"),
        axiosClient.get("/device/lamp/latest"),
        axiosClient.get("/device/door/latest"),
      ]);

      if (tempRes.data.data?.[0]) setSensors(prev => ({ ...prev, temperature: tempRes.data.data[0].temperature }));
      if (humidRes.data.data?.[0]) setSensors(prev => ({ ...prev, humidity: humidRes.data.data[0].humidity }));
      if (gasRes.data.data?.[0]) setSensors(prev => ({ ...prev, gas: gasRes.data.data[0].ppm }));
      if (lightRes.data.data?.[0]) setSensors(prev => ({ ...prev, light: lightRes.data.data[0].lux }));
      
      console.log("💡 Lamp Response:", lampRes.data);
      console.log("🚪 Door Response:", doorRes.data);
      
      if (lampRes.data.data) {
        const lampOn = lampRes.data.data.status === "on";
        console.log("Setting lamp to:", lampOn, "(status:", lampRes.data.data.status, ")");
        setDevices(prev => ({ ...prev, lamp: lampOn }));
      }
      if (doorRes.data.data) {
        const doorLocked = doorRes.data.data.status === "locked";
        console.log("Setting door to:", doorLocked, "(status:", doorRes.data.data.status, ")");
        setDevices(prev => ({ ...prev, door: doorLocked }));
      }
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    }
  };

  const StatCard = ({ icon: Icon, label, value, unit, color }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">
        {typeof value === "number" ? value.toFixed(1) : value}
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">{unit}</span>
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );

  const DeviceCard = ({ icon: Icon, label, status, statusLabel }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <div className={`p-3 rounded-xl ${status ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          <Icon size={24} className={status ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {statusLabel}
      </p>
      <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
        Active
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Sensor Grid */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Environmental Sensors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Thermometer} label="Temperature" value={sensors.temperature} unit="°C" color="bg-red-500" />
          <StatCard icon={Droplets} label="Humidity" value={sensors.humidity} unit="%" color="bg-blue-500" />
          <StatCard icon={Wind} label="Gas Level" value={sensors.gas} unit="PPM" color="bg-orange-500" />
          <StatCard icon={Sun} label="Light Level" value={sensors.light} unit="LUX" color="bg-yellow-500" />
        </div>
      </section>

      {/* Device Status */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Device Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DeviceCard icon={Lightbulb} label="Lamp" status={devices.lamp} statusLabel={devices.lamp ? "ON" : "OFF"} />
          <DeviceCard icon={Lock} label="Door" status={devices.door} statusLabel={devices.door ? "LOCKED" : "UNLOCKED"} />
        </div>
      </section>
    </div>
  );
}
