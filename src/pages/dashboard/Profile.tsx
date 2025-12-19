// src/pages/dashboard/Profile.tsx
import React, { useEffect, useState, useRef } from "react";
import { User, Mail, Shield, Calendar, Camera, Lock, Edit2, X, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import userApi, { UpdateProfileRequest, ChangePasswordRequest } from "../../api/userApi";
import { User as UserType } from "../../api/adminApi";

export default function Profile(): JSX.Element {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [reEnrollMode, setReEnrollMode] = useState(false);

    // Edit profile state
    const [editForm, setEditForm] = useState<UpdateProfileRequest>({ name: "", email: "" });
    const [editLoading, setEditLoading] = useState(false);

    // Change password state
    const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
        current_password: "",
        new_password: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Re-enroll face state
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [reEnrollLoading, setReEnrollLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const { isDark } = useTheme();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // Get user ID from localStorage (assuming it's stored during login)
            const userDataStr = localStorage.getItem("auth_user");
            if (!userDataStr) {
                alert("User not logged in");
                return;
            }

            const userData = JSON.parse(userDataStr);
            const userId = userData.user_id;

            const res = await userApi.getProfile(userId);
            if (res.data.success && res.data.data) {
                setUser(res.data.data);
                setEditForm({ name: res.data.data.name, email: res.data.data.email });
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            alert("Gagal memuat profil");
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = async () => {
        if (!user) return;

        setEditLoading(true);
        try {
            const res = await userApi.updateProfile(user.user_id, editForm);
            if (res.data.success) {
                alert("Profil berhasil diupdate");
                setUser(res.data.data);
                setEditMode(false);

                // Update localStorage
                localStorage.setItem("auth_user", JSON.stringify(res.data.data));
            }
        } catch (err: any) {
            alert(err?.response?.data?.error || "Gagal update profil");
        } finally {
            setEditLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;

        setPasswordLoading(true);
        try {
            const res = await userApi.changePassword(user.user_id, passwordForm);
            if (res.data.success) {
                alert("Password berhasil diubah");
                setPasswordMode(false);
                setPasswordForm({ current_password: "", new_password: "" });
            }
        } catch (err: any) {
            alert(err?.response?.data?.error || "Gagal ubah password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const startWebcam = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            alert("Gagal mengakses webcam");
        }
    };

    const stopWebcam = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL("image/jpeg");
                setCapturedImage(imageData);
                stopWebcam();
            }
        }
    };

    const handleReEnrollFace = async () => {
        if (!user || !capturedImage) return;

        setReEnrollLoading(true);
        try {
            // Remove data:image/jpeg;base64, prefix
            const base64Image = capturedImage.split(",")[1];

            const res = await userApi.reEnrollFace(user.user_id, base64Image);
            if (res.data.success) {
                alert("Wajah berhasil di-enroll ulang!");
                setUser(res.data.data);
                setReEnrollMode(false);
                setCapturedImage(null);

                // Update localStorage
                localStorage.setItem("auth_user", JSON.stringify(res.data.data));

            }
        } catch (err: any) {
            alert(err?.response?.data?.error || "Gagal re-enroll wajah");
        } finally {
            setReEnrollLoading(false);
        }
    };

    const openReEnrollModal = () => {
        setReEnrollMode(true);
        setCapturedImage(null);
        startWebcam();
    };

    const closeReEnrollModal = () => {
        setReEnrollMode(false);
        setCapturedImage(null);
        stopWebcam();
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8 flex items-center justify-center`}>
                <div className="text-center">
                    <div className={`w-8 h-8 border-4 border-t-blue-600 border-slate-300 rounded-full animate-spin mx-auto mb-4`}></div>
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>Memuat profil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
                <div className="text-center">
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>User tidak ditemukan</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"} p-4 sm:p-6 lg:p-8`}>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Profil Saya
                </h1>
                <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Kelola informasi profil dan keamanan akun Anda
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info Card */}
                <div className="lg:col-span-2">
                    <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                Informasi Profil
                            </h2>
                            {!editMode && (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profil
                                </button>
                            )}
                        </div>

                        {editMode ? (
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Nama
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className={`w-full px-4 py-2 rounded-lg border ${isDark
                                            ? "bg-slate-700 border-slate-600 text-white"
                                            : "bg-white border-slate-300 text-slate-900"
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className={`w-full px-4 py-2 rounded-lg border ${isDark
                                            ? "bg-slate-700 border-slate-600 text-white"
                                            : "bg-white border-slate-300 text-slate-900"
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className={`flex-1 px-4 py-2 rounded-lg font-semibold ${isDark
                                            ? "bg-slate-700 hover:bg-slate-600 text-white"
                                            : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                                            }`}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleEditProfile}
                                        disabled={editLoading}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
                                    >
                                        {editLoading ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                                    <div>
                                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Nama</p>
                                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                                    <div>
                                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Email</p>
                                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                                    <div>
                                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Role</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${user.role === "admin"
                                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                            }`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                                    <div>
                                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Terdaftar Sejak</p>
                                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                            {new Date(user.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Security & Face Card */}
                <div className="space-y-6">
                    {/* Change Password Card */}
                    <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                        <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                            Keamanan
                        </h3>
                        {!passwordMode ? (
                            <button
                                onClick={() => setPasswordMode(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                            >
                                <Lock className="w-5 h-5" />
                                Ubah Password
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    placeholder="Password Lama"
                                    value={passwordForm.current_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                                        ? "bg-slate-700 border-slate-600 text-white"
                                        : "bg-white border-slate-300 text-slate-900"
                                        } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                />
                                <input
                                    type="password"
                                    placeholder="Password Baru (min 6 karakter)"
                                    value={passwordForm.new_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border ${isDark
                                        ? "bg-slate-700 border-slate-600 text-white"
                                        : "bg-white border-slate-300 text-slate-900"
                                        } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setPasswordMode(false);
                                            setPasswordForm({ current_password: "", new_password: "" });
                                        }}
                                        className={`flex-1 px-4 py-2 rounded-lg font-semibold ${isDark
                                            ? "bg-slate-700 hover:bg-slate-600 text-white"
                                            : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                                            }`}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={passwordLoading || !passwordForm.current_password || !passwordForm.new_password}
                                        className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold disabled:opacity-50"
                                    >
                                        {passwordLoading ? "Mengubah..." : "Ubah"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Face Encoding Card */}
                    <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-sm p-6`}>
                        <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                            Face Recognition
                        </h3>
                        <div className="mb-4">
                            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} mb-2`}>Status:</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${user.face_encoding_path
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                }`}>
                                {user.face_encoding_path ? "Terdaftar" : "Belum Terdaftar"}
                            </span>
                        </div>
                        <button
                            onClick={openReEnrollModal}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                            <Camera className="w-5 h-5" />
                            {user.face_encoding_path ? "Re-enroll Wajah" : "Daftar Wajah"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Re-enroll Face Modal */}
            {reEnrollMode && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`rounded-2xl border ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"} shadow-xl max-w-2xl w-full`}>
                        <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {user.face_encoding_path ? "Re-enroll Wajah" : "Daftar Wajah"}
                            </h2>
                            <button
                                onClick={closeReEnrollModal}
                                className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                            >
                                <X className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
                            </button>
                        </div>

                        <div className="p-6">
                            {!capturedImage ? (
                                <div>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        className="w-full rounded-lg mb-4"
                                    />
                                    <button
                                        onClick={capturePhoto}
                                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                                    >
                                        📸 Ambil Foto
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <img
                                        src={capturedImage}
                                        alt="Captured"
                                        className="w-full rounded-lg mb-4"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setCapturedImage(null);
                                                startWebcam();
                                            }}
                                            className={`flex-1 px-4 py-2 rounded-lg font-semibold ${isDark
                                                ? "bg-slate-700 hover:bg-slate-600 text-white"
                                                : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                                                }`}
                                        >
                                            Foto Ulang
                                        </button>
                                        <button
                                            onClick={handleReEnrollFace}
                                            disabled={reEnrollLoading}
                                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
                                        >
                                            {reEnrollLoading ? "Memproses..." : "Submit"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                    </div>
                </div>
            )}
        </div>
    );
}
