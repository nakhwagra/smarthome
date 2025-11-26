// import React, { useEffect, useState } from "react";
// import deviceApi from "../api/deviceApi";
// import DeviceCard from "../components/DeviceCard";
// import SensorWidget from "../components/SensorWidget";

// export default function Dashboard() {
//     const [devices, setDevices] = useState([]);
//     const [sensors, setSensors] = useState([]);

//     useEffect(() => {
//         // ambil dari json-server
//         deviceApi.getAll().then(res => setDevices(res.data)).catch(console.error);
//         // contoh sensor fetch via sensorApi (bisa dibuat)
//         fetch("http://localhost:4000/sensor_logs")
//             .then(r => r.json())
//             .then(setSensors)
//             .catch(() => { });
//     }, []);

//     const handleToggle = (id, nextStatus) => {
//         // update UI optimis & panggil API
//         setDevices(prev => prev.map(d => (d.id === id ? { ...d, status: nextStatus } : d)));
//         // patch ke json-server
//         fetch(`http://localhost:4000/devices/${id}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ status: nextStatus })
//         }).catch(console.error);
//     };

//     return (
//         <div className="p-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <SensorWidget title="Temperature" value="28" unit="°C" />
//                 <SensorWidget title="Humidity" value="65" unit="%" />
//                 <SensorWidget title="Gas" value="0.02" unit="ppm" />
//             </div>

//             <div>
//                 <h2 className="text-lg font-semibold mb-4">Devices</h2>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {devices.map(d => (
//                         <DeviceCard key={d.id} device={d} onToggleStatus={handleToggle} />
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default function Dashboard() {
//     return (
//         <div className="p-6">
//             <h1 className="text-3xl font-bold mb-4">Smart Home Dashboard</h1>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <a
//                     href="/devices"
//                     className="bg-white p-5 rounded-xl shadow hover:shadow-lg"
//                 >
//                     <h2 className="text-xl font-semibold">Devices</h2>
//                     <p className="text-gray-600">Lihat & kontrol semua perangkat</p>
//                 </a>

//                 <a
//                     href="/sensors"
//                     className="bg-white p-5 rounded-xl shadow hover:shadow-lg"
//                 >
//                     <h2 className="text-xl font-semibold">Sensors</h2>
//                     <p className="text-gray-600">Monitoring sensor realtime</p>
//                 </a>

//                 <a
//                     href="/history"
//                     className="bg-white p-5 rounded-xl shadow hover:shadow-lg"
//                 >
//                     <h2 className="text-xl font-semibold">History</h2>
//                     <p className="text-gray-600">Riwayat aktivitas sensor</p>
//                 </a>
//             </div>
//         </div>
//     );
// }

// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import deviceApi from "../api/deviceApi";
import DeviceCard from "../components/DeviceCard";
import SensorWidget from "../components/SensorWidget";
import type { AxiosResponse } from "axios";

interface Device {
    id: number;
    name: string;
    type?: string;
    status?: "on" | "off" | string;
    mqtt_topic?: string;
}

interface SensorLog {
    id: number;
    device_id?: number;
    action?: string;
    timestamp?: string;
}

export default function Dashboard(): JSX.Element {
    const [devices, setDevices] = useState<Device[]>([]);
    const [sensors, setSensors] = useState<SensorLog[]>([]);

    useEffect(() => {
        // ambil devices via deviceApi (axios-like)
        deviceApi
            .getAll()
            .then((res: AxiosResponse<Device[]>) => {
                setDevices(res.data ?? []);
            })
            .catch((err: any) => {
                console.error("failed fetching devices:", err);
                setDevices([]);
            });

        // ambil sensor logs langsung dari json-server
        fetch("http://localhost:4000/sensor_logs")
            .then((r) => {
                if (!r.ok) throw new Error("Failed fetch sensor_logs");
                return r.json();
            })
            .then((data: SensorLog[]) => setSensors(data))
            .catch((err) => {
                console.warn("failed fetching sensor_logs:", err);
                setSensors([]);
            });
    }, []);

    const handleToggle = (id: number, nextStatus: "on" | "off" | string) => {
        // update UI optimis
        setDevices((prev) =>
            prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
        );

        // patch ke json-server (example)
        fetch(`http://localhost:4000/devices/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
        }).catch((err) => {
            console.error("PATCH failed:", err);
            // kalau ingin, rollback pada kegagalan:
            // (kamu bisa re-fetch devices di sini atau revert state)
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SensorWidget title="Temperature" value="28" unit="°C" />
                <SensorWidget title="Humidity" value="65" unit="%" />
                <SensorWidget title="Gas" value="0.02" unit="ppm" />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">Devices</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {devices.map((d) => (
                        <DeviceCard
                            key={d.id}
                            device={d}
                            onToggleStatus={(deviceId: number, newStatus: string) =>
                                handleToggle(deviceId, newStatus)
                            }
                        />
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">Recent sensor logs</h2>
                <ul className="bg-white p-4 rounded-lg shadow space-y-2">
                    {sensors.slice(0, 6).map((s) => (
                        <li key={s.id} className="text-sm text-gray-700">
                            {s.timestamp ? new Date(s.timestamp).toLocaleString() + " — " : ""}
                            {s.action ?? "—"}
                        </li>
                    ))}
                    {sensors.length === 0 && <li className="text-sm text-gray-500">No logs</li>}
                </ul>
            </div>
        </div>
    );
}
