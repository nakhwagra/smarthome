// src/pages/Register.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import "../styles/register.css";

export default function Register(): JSX.Element {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [faceImage, setFaceImage] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [capturing, setCapturing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Mulai webcam untuk capture wajah
    const startCamera = async () => {
        setErr(null);
        setCapturing(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            streamRef.current = stream;
        } catch (error) {
            setErr("Gagal mengakses kamera. Pastikan izin kamera diaktifkan.");
            setCapturing(false);
        }
    };

    // Stop webcam
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCapturing(false);
    };

    // Capture foto dari webcam
    const captureFace = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Convert ke base64
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);
        setFaceImage(base64Image);
        stopCamera();
        setSuccess("Foto wajah berhasil diambil!");
    };

    // Reset foto wajah
    const resetFace = () => {
        setFaceImage(null);
        setSuccess(null);
    };

    // Submit registrasi
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setSuccess(null);

        // Validasi
        if (!name.trim() || !email.trim() || !password) {
            setErr("Semua field harus diisi");
            return;
        }

        if (password.length < 6) {
            setErr("Password minimal 6 karakter");
            return;
        }

        if (password !== confirmPassword) {
            setErr("Password dan konfirmasi tidak cocok");
            return;
        }

        if (!faceImage) {
            setErr("Silakan ambil foto wajah terlebih dahulu");
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.register({
                name,
                email,
                password,
                face_image: faceImage
            });

            const body = res.data;

            if (!body.success) {
                setErr(body.message || "Registrasi gagal");
                setLoading(false);
                return;
            }

            setSuccess("Registrasi berhasil! Menunggu persetujuan admin.");
            
            // Redirect ke login setelah 3 detik
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "Terjadi kesalahan";
            setErr(msg);
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-box">
                    <h1>Daftar Akun</h1>
                    <p className="subtitle">Smart Home IoT System</p>

                    {err && <div className="alert alert-error">{err}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={submit} className="register-form">
                        <div className="form-group">
                            <label htmlFor="name">Nama Lengkap</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Masukkan email"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Konfirmasi Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ketik ulang password"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group face-capture-group">
                            <label>Foto Wajah</label>
                            
                            {!faceImage && !capturing && (
                                <button 
                                    type="button" 
                                    onClick={startCamera}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    📷 Ambil Foto Wajah
                                </button>
                            )}

                            {capturing && (
                                <div className="camera-view">
                                    <video ref={videoRef} className="video-preview" />
                                    <div className="camera-controls">
                                        <button 
                                            type="button" 
                                            onClick={captureFace}
                                            className="btn btn-primary"
                                        >
                                            📸 Capture
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={stopCamera}
                                            className="btn btn-secondary"
                                        >
                                            ❌ Batal
                                        </button>
                                    </div>
                                </div>
                            )}

                            {faceImage && (
                                <div className="face-preview">
                                    <img src={faceImage} alt="Captured face" />
                                    <button 
                                        type="button" 
                                        onClick={resetFace}
                                        className="btn btn-secondary btn-sm"
                                        disabled={loading}
                                    >
                                        🔄 Ambil Ulang
                                    </button>
                                </div>
                            )}

                            <canvas ref={canvasRef} style={{ display: "none" }} />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-block"
                            disabled={loading || !faceImage}
                        >
                            {loading ? "Memproses..." : "Daftar"}
                        </button>

                        <p className="register-note">
                            Akun akan aktif setelah disetujui admin
                        </p>

                        <p className="login-link">
                            Sudah punya akun? <a href="/login">Login di sini</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
