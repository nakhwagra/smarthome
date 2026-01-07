// src/pages/admin/UserManagement.tsx
import React, { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Shield, Search, Trash2, Loader, AlertCircle, Edit2, X } from "lucide-react";
import adminApi, { User, UpdateUserRequest } from "../../api/adminApi";
import { useTheme } from "../../context/ThemeContext";

export default function UserManagement(): JSX.Element {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState<{ [key: number]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "rejected">("all");

    // Edit user state
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<UpdateUserRequest>({
        name: "",
        email: "",
        role: "user",
        status: "active"
    });
    const [editLoading, setEditLoading] = useState(false);

    const { isDark } = useTheme();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                // Only remove from state if API confirms success
                setUsers((prev) => prev.filter((u) => u.user_id !== userId));
            } else {
                alert("Gagal menghapus user: " + (res.data.message || "Unknown error"));
                // Refresh to get accurate state
                fetchUsers();
            }
        } catch (err: unknown) {
            console.error("Delete error:", err);
            const axiosErr = err as { response?: { data?: { message?: string }; status?: number }; message?: string };

            // Better error messages
            let errorMsg = "Gagal menghapus user";
            if (axiosErr?.response?.status === 502) {
                errorMsg = "Backend server tidak dapat diakses (502). Periksa koneksi backend.";
            } else if (axiosErr?.response?.data?.message) {
                errorMsg = axiosErr.response.data.message;
            } else if (axiosErr?.message) {
                errorMsg = axiosErr.message;
            }

            alert(errorMsg);

            // Refresh list to ensure UI matches database state
            fetchUsers();
        } finally {
            setDeleteLoading((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        });
    };

    const handleEditSubmit = async () => {
        if (!editingUser) return;

        setEditLoading(true);
        try {
            const res = await adminApi.updateUser(editingUser.user_id, editForm);
            if (res.data.success) {
                alert("User berhasil diupdate");
                // Update user in state
                setUsers((prev) => prev.map((u) =>
                    u.user_id === editingUser.user_id ? res.data.data : u
                ));
                setEditingUser(null);
            } else {
                alert("Gagal update user: " + (res.data.message || "Unknown error"));
            }
        } catch (err: unknown) {
            console.error("Edit error:", err);
            const axiosErr = err as { response?: { data?: { error?: string }; status?: number }; message?: string };

            let errorMsg = "Gagal update user";
            if (axiosErr?.response?.data?.error) {
                errorMsg = axiosErr.response.data.error;
            } else if (axiosErr?.message) {
                errorMsg = axiosErr.message;
            }

            alert(errorMsg);
        } finally {
            setEditLoading(false);
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
                                                    onClick={() => handleEditClick(user)}
                                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all ${isDark
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                                        } shadow-lg hover:shadow-xl`}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
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

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                Edit User
                            </h2>
                            <button
                                onClick={() => setEditingUser(null)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                            >
                                <X className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Name Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Nama <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                        : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="Masukkan nama"
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                        : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="Masukkan email"
                                />
                            </div>

                            {/* Role Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'user' })}
                                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                                        ? "bg-slate-700 border-slate-600 text-white"
                                        : "bg-white border-slate-300 text-slate-900"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Status Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'pending' | 'rejected' })}
                                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                                        ? "bg-slate-700 border-slate-600 text-white"
                                        : "bg-white border-slate-300 text-slate-900"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Face Encoding Path (Read-Only) */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Face Encoding Path
                                    <span className={`ml-2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>(Read-only)</span>
                                </label>
                                <input
                                    type="text"
                                    value={editingUser.face_encoding_path || "Belum ada face encoding"}
                                    disabled
                                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                                        ? "bg-slate-900 border-slate-700 text-slate-500"
                                        : "bg-slate-100 border-slate-200 text-slate-500"
                                        } cursor-not-allowed`}
                                />
                                <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    Face encoding tidak dapat diedit manual. Untuk mengubah, user harus re-enroll wajah.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className={`flex gap-3 p-6 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                            <button
                                onClick={() => setEditingUser(null)}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${isDark
                                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                                    : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                                    }`}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                disabled={editLoading || !editForm.name || !editForm.email}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${editLoading || !editForm.name || !editForm.email
                                    ? isDark
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                                    }`}
                            >
                                {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
