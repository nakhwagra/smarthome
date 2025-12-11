var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Register.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import "../styles/register.css";
export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [faceImage, setFaceImage] = useState(null);
    const [err, setErr] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    // Mulai webcam untuk capture wajah
    const startCamera = () => __awaiter(this, void 0, void 0, function* () {
        setErr(null);
        setCapturing(true);
        try {
            const stream = yield navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            streamRef.current = stream;
        }
        catch (error) {
            setErr("Gagal mengakses kamera. Pastikan izin kamera diaktifkan.");
            setCapturing(false);
        }
    });
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
        if (!videoRef.current || !canvasRef.current)
            return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context)
            return;
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
    const submit = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
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
            const res = yield authApi.register({
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
        }
        catch (error) {
            const msg = ((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || (error === null || error === void 0 ? void 0 : error.message) || "Terjadi kesalahan";
            setErr(msg);
            setLoading(false);
        }
    });
    return (_jsx("div", { className: "register-page", children: _jsx("div", { className: "register-container", children: _jsxs("div", { className: "register-box", children: [_jsx("h1", { children: "Daftar Akun" }), _jsx("p", { className: "subtitle", children: "Smart Home IoT System" }), err && _jsx("div", { className: "alert alert-error", children: err }), success && _jsx("div", { className: "alert alert-success", children: success }), _jsxs("form", { onSubmit: submit, className: "register-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "name", children: "Nama Lengkap" }), _jsx("input", { id: "name", type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Masukkan nama lengkap", disabled: loading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Masukkan email", disabled: loading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Minimal 6 karakter", disabled: loading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "confirmPassword", children: "Konfirmasi Password" }), _jsx("input", { id: "confirmPassword", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "Ketik ulang password", disabled: loading })] }), _jsxs("div", { className: "form-group face-capture-group", children: [_jsx("label", { children: "Foto Wajah" }), !faceImage && !capturing && (_jsx("button", { type: "button", onClick: startCamera, className: "btn btn-secondary", disabled: loading, children: "\uD83D\uDCF7 Ambil Foto Wajah" })), capturing && (_jsxs("div", { className: "camera-view", children: [_jsx("video", { ref: videoRef, className: "video-preview" }), _jsxs("div", { className: "camera-controls", children: [_jsx("button", { type: "button", onClick: captureFace, className: "btn btn-primary", children: "\uD83D\uDCF8 Capture" }), _jsx("button", { type: "button", onClick: stopCamera, className: "btn btn-secondary", children: "\u274C Batal" })] })] })), faceImage && (_jsxs("div", { className: "face-preview", children: [_jsx("img", { src: faceImage, alt: "Captured face" }), _jsx("button", { type: "button", onClick: resetFace, className: "btn btn-secondary btn-sm", disabled: loading, children: "\uD83D\uDD04 Ambil Ulang" })] })), _jsx("canvas", { ref: canvasRef, style: { display: "none" } })] }), _jsx("button", { type: "submit", className: "btn btn-primary btn-block", disabled: loading || !faceImage, children: loading ? "Memproses..." : "Daftar" }), _jsx("p", { className: "register-note", children: "Akun akan aktif setelah disetujui admin" }), _jsxs("p", { className: "login-link", children: ["Sudah punya akun? ", _jsx("a", { href: "/login", children: "Login di sini" })] })] })] }) }) }));
}
