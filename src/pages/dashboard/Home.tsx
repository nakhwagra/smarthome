import { useEffect, useState } from "react";
import { mqttService } from "../../services/mqttService";
import axiosClient from "../../api/axiosClient";
import { Thermometer, Droplets, Wind, Sun, Lightbulb, Lock, type LucideIcon } from "lucide-react";

interface SensorData {
  temperature: number;
  humidity: number;
  gas: number;
  light: number;
}

interface DeviceStatus {
  lamp: boolean;
  door: boolean;
}

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit: string;
  color: string;
  isLive: boolean;
};

type DeviceCardProps = {
  icon: LucideIcon;
  label: string;
  status: boolean;
  statusLabel: string;
};

const StatCard = ({ icon: Icon, label, value, unit, color, isLive }: StatCardProps) => (
  <div className="p-6 transition-shadow bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700 hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900 dark:text-white">
      {typeof value === "number" ? value.toFixed(1) : value}
      <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{unit}</span>
    </p>
    <div className="flex items-center mt-2">
      <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {isLive ? 'Live' : 'Offline'}
      </p>
    </div>
  </div>
);

const DeviceCard = ({ icon: Icon, label, status, statusLabel }: DeviceCardProps) => (
  <div className="p-6 transition-shadow bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700 hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <div className={`p-3 rounded-xl ${status ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
        <Icon size={24} className={status ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">
      {statusLabel}
    </p>
    <div className="inline-block px-3 py-1 mt-4 text-xs font-semibold text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-300">
      Active
    </div>
  </div>
);

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

  const [isConnected, setIsConnected] = useState(false);

  const setupMQTTListeners = () => {
    const handleTemperature = (data: { temperature: number }) => {
      setSensors(prev => ({ ...prev, temperature: data.temperature }));
    };

    const handleHumidity = (data: { humidity: number }) => {
      setSensors(prev => ({ ...prev, humidity: data.humidity }));
    };

    const handleGas = (data: { gas: number }) => {
      setSensors(prev => ({ ...prev, gas: data.gas }));
    };

    const handleLight = (data: { light: number }) => {
      setSensors(prev => ({ ...prev, light: data.light }));
    };

    const handleLampStatus = (data: { status: string }) => {
      setDevices(prev => ({ ...prev, lamp: data.status === "on" }));
    };

    const handleDoorStatus = (data: { status: string }) => {
      setDevices(prev => ({ ...prev, door: data.status === "locked" }));
    };

    mqttService.on('temperature', handleTemperature);
    mqttService.on('humidity', handleHumidity);
    mqttService.on('gas', handleGas);
    mqttService.on('light', handleLight);
    mqttService.on('lamp_status', handleLampStatus);
    mqttService.on('door_status', handleDoorStatus);
  };

  const fetchInitialData = async () => {
    try {
      const response = await axiosClient.get("/dashboard/initial");
      if (response.data.data) {
        const { sensors: sensorData, devices: deviceData } = response.data.data;
        setSensors({
          temperature: sensorData.temperature || 0,
          humidity: sensorData.humidity || 0,
          gas: sensorData.gas || 0,
          light: sensorData.light || 0,
        });
        setDevices({
          lamp: deviceData.lamp === "on",
          door: deviceData.door === "locked",
        });
      }
    } catch {
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
        if (gasRes.data.data?.[0]) setSensors(prev => ({ ...prev, gas: gasRes.data.data[0].ppm_value ?? gasRes.data.data[0].ppm ?? 0 }));
        if (lightRes.data.data?.[0]) setSensors(prev => ({ ...prev, light: lightRes.data.data[0].lux }));

        if (lampRes.data.data) {
          setDevices(prev => ({ ...prev, lamp: lampRes.data.data.status === "on" }));
        }
        if (doorRes.data.data) {
          setDevices(prev => ({ ...prev, door: doorRes.data.data.status === "locked" }));
        }
      } catch {
        // Silent fallback failure
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      setupMQTTListeners();
      await fetchInitialData();

      try {
        await mqttService.connect();
        if (isMounted) {
          setIsConnected(true);
        }
      } catch {
        if (isMounted) {
          setIsConnected(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
      mqttService.disconnect();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Sensor Grid */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Environmental Sensors</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Thermometer} label="Temperature" value={sensors.temperature} unit="°C" color="bg-red-500" isLive={isConnected} />
          <StatCard icon={Droplets} label="Humidity" value={sensors.humidity} unit="%" color="bg-blue-500" isLive={isConnected} />
          <StatCard icon={Wind} label="Gas Level" value={sensors.gas} unit="PPM" color="bg-orange-500" isLive={isConnected} />
          <StatCard icon={Sun} label="Light Level" value={sensors.light} unit="LUX" color="bg-yellow-500" isLive={isConnected} />
        </div>
      </section>

      {/* Device Status */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Device Status</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DeviceCard icon={Lightbulb} label="Lamp" status={devices.lamp} statusLabel={devices.lamp ? "ON" : "OFF"} />
          <DeviceCard icon={Lock} label="Door" status={devices.door} statusLabel={devices.door ? "LOCKED" : "UNLOCKED"} />
        </div>
      </section>
    </div>
  );
}
