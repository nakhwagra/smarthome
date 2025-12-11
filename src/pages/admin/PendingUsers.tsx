// src/pages/admin/PendingUsers.tsx
import React, { useEffect, useState } from "react";
import { Check, X, AlertCircle, Loader } from "lucide-react";
import adminApi, { PendingUser } from "../../api/adminApi";
import { useTheme } from "../../context/ThemeContext";

export default function PendingUsers(): JSX.Element {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
    const { isDark } = useTheme();

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getPendingUsers();
            if (res.data.success && res.data.data) {
                console.log("📋 Pending users data:", res.data.data);
                setUsers(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch pending users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: number) => {
        console.log("🔍 Approving user with ID:", userId);
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const res = await adminApi.approveUser(userId);
            if (res.data.success) {
                alert("User berhasil disetujui");
                setUsers(prev => prev.filter(u => u.user_id !== userId));
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr?.response?.data?.message || "Gagal menyetujui user");
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleReject = async (userId: number) => {
        if (!confirm("Yakin ingin menolak user ini?")) return;

        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const res = await adminApi.rejectUser(userId);
            if (res.data.success) {
                alert("User berhasil ditolak");
                setUsers(prev => prev.filter(u => u.user_id !== userId));
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr?.response?.data?.message || "Gagal menolak user");
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8 flex items-center justify-center`}>
                <div className="text-center">
                    <Loader className={`w-8 h-8 animate-spin mx-auto mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Pending Users
                </h1>
                <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Setujui atau tolak registrasi user baru
                </p>
            </div>

            {/* Users Card */}
            <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className={`w-12 h-12 mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                        <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            Tidak ada user pending
                        </h3>
                        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                            Semua user sudah diproses
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        ID
                                    </th>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Nama
                                    </th>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Email
                                    </th>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Tanggal Daftar           
                                    </th>
                                    <th className={`text-right py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr 
                                        key={user.user_id} 
                                        className={`border-b transition-colors ${
                                            isDark
                                                ? "border-slate-700 hover:bg-slate-700/50"
                                                : "border-slate-100 hover:bg-slate-50"
                                        }`}
                                    >
                                        <td className={`py-3 px-4 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                                            #{user.user_id}
                                        </td>
                                        <td className={`py-3 px-4 text-sm ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                                            {user.name}
                                        </td>
                                        <td className={`py-3 px-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                            {user.email}
                                        </td>
                                        <td className={`py-3 px-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                            {new Date(user.created_at).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleApprove(user.user_id)}
                                                    disabled={actionLoading[user.user_id]}
                                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                                                        actionLoading[user.user_id]
                                                            ? isDark
                                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                            : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                                                    }`}
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Setujui
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(user.user_id)}
                                                    disabled={actionLoading[user.user_id]}
                                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                                                        actionLoading[user.user_id]
                                                            ? isDark
                                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                            : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                                                    }`}
                                                >
                                                    <X className="w-4 h-4" />
                                                    Tolak
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
