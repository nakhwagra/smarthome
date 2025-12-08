// src/pages/admin/PendingUsers.tsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "../../styles/dashboard.css";

interface PendingUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export default function PendingUsers(): JSX.Element {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/admin/users/pending");
            if (res.data.success && res.data.data) {
                setUsers(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch pending users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: number) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const res = await axiosClient.post(`/user/${userId}/approve`);
            if (res.data.success) {
                alert("User berhasil disetujui");
                setUsers(prev => prev.filter(u => u.id !== userId));
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || "Gagal menyetujui user");
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleReject = async (userId: number) => {
        if (!confirm("Yakin ingin menolak user ini?")) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const res = await axiosClient.post(`/user/${userId}/reject`);
            if (res.data.success) {
                alert("User berhasil ditolak");
                setUsers(prev => prev.filter(u => u.id !== userId));
            }
        } catch (err: any) {
            alert(err?.response?.data?.message || "Gagal menolak user");
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="pending-users-page">
                <div className="page-header">
                    <h1>Pending Users</h1>
                    <p>Setujui atau tolak registrasi user baru</p>
                </div>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="pending-users-page">
            <div className="page-header">
                <h1>Pending Users</h1>
                <p>Setujui atau tolak registrasi user baru</p>
            </div>

            <div className="card">
                {users.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✅</div>
                        <h3>Tidak ada user pending</h3>
                        <p>Semua user sudah diproses</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Tanggal Daftar</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{new Date(user.created_at).toLocaleString("id-ID")}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button 
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleApprove(user.id)}
                                                    disabled={actionLoading[user.id]}
                                                >
                                                    ✓ Setujui
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleReject(user.id)}
                                                    disabled={actionLoading[user.id]}
                                                >
                                                    ✕ Tolak
                                                </button>
                                            </div>
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
