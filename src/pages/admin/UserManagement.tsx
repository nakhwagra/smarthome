// src/pages/admin/UserManagement.tsx
import React, { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Shield, Search, Trash2, Loader, AlertCircle } from "lucide-react";
import adminApi, { User } from "../../api/adminApi";
import { useTheme } from "../../context/ThemeContext";

export default function UserManagement(): JSX.Element {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState<{ [key: number]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "rejected">("all");
    const { isDark } = useTheme();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getAllUsers();
            if (res.data.success && res.data.data) {
                setUsers(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.name.toLowerCase().includes(query) ||
                    u.email.toLowerCase().includes(query)
            );
        }

        // Role filter
        if (roleFilter !== "all") {
            filtered = filtered.filter((u) => u.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((u) => u.status === statusFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleDelete = async (userId: number, userName: string) => {
        if (!confirm(`Yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        setDeleteLoading((prev) => ({ ...prev, [userId]: true }));
        try {
            const res = await adminApi.deleteUser(userId);
            if (res.data.success) {
                alert("User berhasil dihapus");
                setUsers((prev) => prev.filter((u) => u.user_id !== userId));
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr?.response?.data?.message || "Gagal menghapus user");
        } finally {
            setDeleteLoading((prev) => ({ ...prev, [userId]: false }));
        }
    };

    // Statistics
    const stats = {
        total: users.length,
        active: users.filter((u) => u.status === "active").length,
        pending: users.filter((u) => u.status === "pending").length,
        admins: users.filter((u) => u.role === "admin").length,
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8 flex items-center justify-center`}>
                <div className="text-center">
                    <Loader className={`w-8 h-8 animate-spin mx-auto mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>Memuat data users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    User Management
                </h1>
                <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Kelola semua user dalam sistem
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats.total}
                    color="bg-blue-500"
                    isDark={isDark}
                />
                <StatCard
                    icon={UserCheck}
                    label="Active Users"
                    value={stats.active}
                    color="bg-green-500"
                    isDark={isDark}
                />
                <StatCard
                    icon={UserX}
                    label="Pending Approval"
                    value={stats.pending}
                    color="bg-amber-500"
                    isDark={isDark}
                />
                <StatCard
                    icon={Shield}
                    label="Administrators"
                    value={stats.admins}
                    color="bg-purple-500"
                    isDark={isDark}
                />
            </div>

            {/* Filters and Search */}
            <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6 mb-6`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark
                                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                            className={`px-4 py-2 rounded-lg border ${isDark
                                    ? "bg-slate-700 border-slate-600 text-white"
                                    : "bg-white border-slate-300 text-slate-900"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="all">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                            className={`px-4 py-2 rounded-lg border ${isDark
                                    ? "bg-slate-700 border-slate-600 text-white"
                                    : "bg-white border-slate-300 text-slate-900"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className={`mt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Menampilkan {filteredUsers.length} dari {users.length} users
                </div>
            </div>

            {/* Users Table */}
            <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className={`w-12 h-12 mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                        <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            Tidak ada user ditemukan
                        </h3>
                        <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                            Coba ubah filter atau kata kunci pencarian
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
                                        Role
                                    </th>
                                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Status
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
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.user_id}
                                        className={`border-b transition-colors ${isDark
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
                                        <td className="py-3 px-4 text-sm">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === "admin"
                                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                    }`}
                                            >
                                                {user.role === "admin" && <Shield className="w-3 h-3" />}
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <span
                                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${user.status === "active"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                        : user.status === "pending"
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                    }`}
                                            >
                                                {user.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className={`py-3 px-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                            {new Date(user.created_at).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(user.user_id, user.name)}
                                                    disabled={deleteLoading[user.user_id]}
                                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all ${deleteLoading[user.user_id]
                                                            ? isDark
                                                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                            : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                                                        }`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Hapus
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

// Statistics Card Component
interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
    isDark: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, isDark }) => (
    <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
        <div className="flex items-center justify-between">
            <div>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{label}</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);
