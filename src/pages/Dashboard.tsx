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
import useWebSocket from "../hooks/useWebSocket";

interface Device {
    id: number;
    name: string;
    type?: string;
    status?: "on" | "off";
    mqtt_topic?: string;
}

interface SensorData {
    temperature: number;
    humidity: number;
    gas_ppm: number;
}

interface SensorLog {
    id: number;
    // device_id?: number;
    action: string;
    timestamp: string;
}

export default function Dashboard(): JSX.Element {
    const [devices, setDevices] = useState<Device[]>([]);
    const [logs, setLogs] = useState<SensorLog[]>([]);
    const [sensors, setSensors] = useState<SensorData>({ temperature: 0, humidity: 0, gas_ppm: 0 });

    const lastMessage = useWebSocket("ws://localhost:8080/api/ws");

    useEffect(() => {
        // fetch devices by calling each "latest" and mapping to UI devices
        Promise.all([deviceApi.getLampLatest().catch(() => null), deviceApi.getDoorLatest().catch(() => null), deviceApi.getCurtainLatest().catch(() => null)])
            .then(([lampRes, doorRes, curtainRes]) => {
                const list: Device[] = [];

                if (lampRes?.data) {
                    const d: any = lampRes.data;
                    list.push({
                        id: Number(d.lamp_id ?? d.id ?? Date.now() + 1),
                        name: "Lamp",
                        type: "lamp",
                        status: d.status === "on" ? "on" : "off",
                        mqtt_topic: d.mqtt_topic ?? undefined,
                    });
                }

                if (doorRes?.data) {
                    const d: any = doorRes.data;
                    // door status from backend might be 'locked'|'unlocked' — map to on/off for UI
                    const mappedStatus = d.status === "unlocked" ? "on" : "off";
                    list.push({
                        id: Number(d.door_id ?? d.id ?? Date.now() + 2),
                        name: "Door",
                        type: "door",
                        status: mappedStatus,
                    });
                }

                if (curtainRes?.data) {
                    const d: any = curtainRes.data;
                    const mapped = d.position && Number(d.position) > 0 ? "on" : "off";
                    list.push({
                        id: Number(d.curtain_id ?? d.id ?? Date.now() + 3),
                        name: "Curtain",
                        type: "curtain",
                        status: mapped,
                    });
                }

                setDevices(list);
            })
            .catch((err) => {
                console.error("Failed fetching device latests:", err);
                setDevices([]);
            });

        // access logs — call GET /api/access-log/ to get recent logs
        fetch("http://localhost:8080/api/access-log/")
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((data: any[]) => {
                const normalized = (data ?? []).map((it: any, idx: number) => ({
                    id: it.access_id ?? idx,
                    action: `${it.method ?? "?"} / ${it.status ?? "?"}`,
                    timestamp: it.timestamp ?? it.created_at ?? new Date().toISOString(),
                }));
                setLogs(normalized.slice(0, 6));
            })
            .catch((err) => {
                console.warn("Failed fetching access logs:", err);
                setLogs([]);
            });

        // sensors — get latest from sensor endpoints; choose the most recent entries
        Promise.all([
            fetch("http://localhost:8080/api/sensor/temperature").then((r) => (r.ok ? r.json() : Promise.reject(r))),
            fetch("http://localhost:8080/api/sensor/humidity").then((r) => (r.ok ? r.json() : Promise.reject(r))),
            fetch("http://localhost:8080/api/sensor/gas").then((r) => (r.ok ? r.json() : Promise.reject(r))),
        ])
            .then(([temp, humid, gas]: any) => {
                const t = Array.isArray(temp) ? temp[0]?.temperature ?? 0 : temp.temperature ?? 0;
                const h = Array.isArray(humid) ? humid[0]?.humidity ?? 0 : humid.humidity ?? 0;
                const g = Array.isArray(gas) ? gas[0]?.ppm_value ?? gas[0]?.ppm ?? 0 : gas.ppm_value ?? gas.ppm ?? 0;
                setSensors({ temperature: Number(t), humidity: Number(h), gas_ppm: Number(g) });
            })
            .catch(() => {
                // ignore if not present
            });
    }, []);

    // handle websocket incoming messages
    useEffect(() => {
        if (!lastMessage) return;
        let payload: any;
        try {
            payload = JSON.parse(lastMessage);
        } catch {
            console.warn("WS payload not JSON:", lastMessage);
            return;
        }

        // sensor payload
        if ("temperature" in payload && "humidity" in payload && ("gas_ppm" in payload || "ppm" in payload || "ppm_value" in payload)) {
            const t = Number(payload.temperature ?? 0);
            const h = Number(payload.humidity ?? 0);
            const g = Number(payload.gas_ppm ?? payload.ppm ?? payload.ppm_value ?? 0);
            setSensors({ temperature: t, humidity: h, gas_ppm: g });
            return;
        }

        // log / device update payload
        if ("action" in payload || "device_id" in payload || "device" in payload) {
            const log: SensorLog = {
                id: typeof payload.id === "number" ? payload.id : Date.now(),
                action: String(payload.action ?? payload.message ?? "event"),
                timestamp: String(payload.timestamp ?? new Date().toISOString()),
            };
            setLogs((prev) => [log, ...prev].slice(0, 6));

            // update device status if present
            const deviceId = payload.device_id ?? payload.id ?? payload.device?.id;
            if (typeof deviceId === "number" && "status" in payload) {
                setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, status: payload.status === "on" ? "on" : "off" } : d)));
            }
        }
    }, [lastMessage]);

    // handle toggling a device — map to control endpoints depending on device type
    const handleToggle = async (id: number, nextStatus: "on" | "off") => {
        // optimistic update
        setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d)));

        // find device type
        const dev = devices.find((x) => x.id === id);
        try {
            if (!dev) throw new Error("Device not found");

            if (dev.type === "lamp") {
                // send payload with various possible id fields to be tolerant
                await deviceApi.toggleLamp({ lamp_id: id, id, status: nextStatus });
            } else if (dev.type === "door") {
                await deviceApi.controlDoor({ door_id: id, id, status: nextStatus });
            } else if (dev.type === "curtain") {
                // for curtain, we may set position instead of on/off; use position 100 for 'on', 0 for 'off'
                const position = nextStatus === "on" ? 100 : 0;
                await deviceApi.controlCurtain({ curtain_id: id, id, position, status: nextStatus });
            } else {
                // fallback to generic control
                await deviceApi.toggleLamp({ id, status: nextStatus });
            }
        } catch (err) {
            console.error("Toggle failed:", err);
            // rollback: re-fetch devices
            deviceApi
                .getLampLatest()
                .catch(() => null)
                .then(() => {
                    // re-fetch all latests quickly
                    return Promise.all([deviceApi.getLampLatest().catch(() => null), deviceApi.getDoorLatest().catch(() => null), deviceApi.getCurtainLatest().catch(() => null)]);
                })
                .then(([lampRes, doorRes, curtainRes]) => {
                    const list: Device[] = [];
                    if (lampRes?.data) {
                        const d: any = lampRes.data;
                        list.push({ id: Number(d.lamp_id ?? d.id ?? Date.now() + 1), name: "Lamp", type: "lamp", status: d.status === "on" ? "on" : "off" });
                    }
                    if (doorRes?.data) {
                        const d: any = doorRes.data;
                        list.push({ id: Number(d.door_id ?? d.id ?? Date.now() + 2), name: "Door", type: "door", status: d.status === "unlocked" ? "on" : "off" });
                    }
                    if (curtainRes?.data) {
                        const d: any = curtainRes.data;
                        list.push({ id: Number(d.curtain_id ?? d.id ?? Date.now() + 3), name: "Curtain", type: "curtain", status: d.position && Number(d.position) > 0 ? "on" : "off" });
                    }
                    setDevices(list);
                })
                .catch(() => { });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SensorWidget title="Temperature" value={sensors.temperature} unit="°C" />
                <SensorWidget title="Humidity" value={sensors.humidity} unit="%" />
                <SensorWidget title="Gas" value={Number(sensors.gas_ppm).toFixed(2)} unit="ppm" />
            </div>

            <section>
                <h2 className="text-lg font-semibold mb-4">Devices</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {devices.map((d) => (
                        <DeviceCard key={d.id} device={d} onToggleStatus={handleToggle} />
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-4">Recent sensor logs</h2>
                <ul className="bg-white p-4 rounded-lg shadow space-y-2">
                    {logs.length > 0 ? (
                        logs.map((s) => (
                            <li key={s.id} className="text-sm text-gray-700">
                                {new Date(s.timestamp).toLocaleString()} — {s.action}
                            </li>
                        ))
                    ) : (
                        <li className="text-sm text-gray-500">No logs</li>
                    )}
                </ul>
            </section>
        </div>
    );
}