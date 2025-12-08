// src/pages/dashboard/Door.tsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import websocketService, { WS_TYPES } from "../../services/websocketService";
import "../../styles/dashboard.css";

interface AccessLog {
    id: number;
    method: string;
    status: string;
    timestamp: string;
    user_name?: string;
}

export default function Door(): JSX.Element {
    const [doorStatus, setDoorStatus] = useState<string>("closed");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<AccessLog[]>([]);

    useEffect(() => {
        fetchDoorStatus();
        fetchAccessLogs();

        // WebSocket listener untuk door status
        const handleDoorStatus = (data: any) => {
            setDoorStatus(data.status);
        };

        const handleAccessLog = (data: any) => {
            // Tambah log baru ke list
            setLogs(prev => [data, ...prev].slice(0, 10));
        };

        websocketService.on(WS_TYPES.DOOR_STATUS, handleDoorStatus);
        websocketService.on(WS_TYPES.ACCESS_LOG, handleAccessLog);

        return () => {
            websocketService.off(WS_TYPES.DOOR_STATUS, handleDoorStatus);
            websocketService.off(WS_TYPES.ACCESS_LOG, handleAccessLog);
        };
    }, []);

    const fetchDoorStatus = async () => {
        try {
            const res = await axiosClient.get("/door/status");
            if (res.data.success && res.data.data) {
                setDoorStatus(res.data.data.status);
            }
        } catch (err) {
            console.error("Failed to fetch door status:", err);
        }
    };

    const fetchAccessLogs = async () => {
        try {
            const res = await axiosClient.get("/access-logs?limit=10");
            if (res.data.success && res.data.data) {
                setLogs(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch access logs:", err);
        }
    };

    const handleDoorControl = async (action: "open" | "close") => {
        setLoading(true);
        try {
            await axiosClient.post("/door/control", { action });
        } catch (err: any) {
            alert(err?.response?.data?.message || "Gagal mengontrol pintu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="door-page">
            <div className="page-header">
                <h1>Kontrol Pintu</h1>
                <p>Buka/tutup pintu dan lihat riwayat akses</p>
            </div>

            {/* Door Status Card */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Status Pintu</h3>
                    <span className={`status-badge ${doorStatus === "closed" ? "closed" : "open"}`}>
                        {doorStatus === "closed" ? "Tertutup" : "Terbuka"}
                    </span>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                    <button 
                        className="btn btn-success" 
                        onClick={() => handleDoorControl("open")}
                        disabled={loading || doorStatus === "open"}
                    >
                        Buka Pintu
                    </button>
                    <button 
                        className="btn btn-danger" 
                        onClick={() => handleDoorControl("close")}
                        disabled={loading || doorStatus === "closed"}
                    >
                        Tutup Pintu
                    </button>
                </div>
            </div>

            {/* Access Logs */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Riwayat Akses</h3>
                    <button className="btn btn-sm btn-secondary" onClick={fetchAccessLogs}>
                        🔄 Refresh
                    </button>
                </div>
                
                {logs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>Belum ada riwayat akses</h3>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Metode</th>
                                    <th>User</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.timestamp).toLocaleString("id-ID")}</td>
                                        <td>{log.method}</td>
                                        <td>{log.user_name || "-"}</td>
                                        <td>
                                            <span className={`status-badge ${log.status === "success" ? "active" : "suspended"}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
