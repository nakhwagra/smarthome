// src/pages/admin/Settings.tsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "../../styles/dashboard.css";

export default function Settings(): JSX.Element {
    const [currentPin, setCurrentPin] = useState<string>("");
    const [newPin, setNewPin] = useState<string>("");
    const [confirmPin, setConfirmPin] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchCurrentPin();
    }, []);

    const fetchCurrentPin = async () => {
        try {
            const res = await axiosClient.get("/admin/pin");
            if (res.data.success && res.data.data) {
                setCurrentPin(res.data.data.universal_pin || "");
            }
        } catch (err) {
            console.error("Failed to fetch current PIN:", err);
        }
    };

    const handleUpdatePin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validasi
        if (!newPin || newPin.length !== 6) {
            setError("PIN harus 6 digit");
            return;
        }

        if (!/^\d{6}$/.test(newPin)) {
            setError("PIN harus berupa angka");
            return;
        }

        if (newPin !== confirmPin) {
            setError("PIN dan konfirmasi tidak cocok");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post("/admin/pin", { pin: newPin });
            if (res.data.success) {
                setSuccess("PIN berhasil diperbarui");
                setCurrentPin(newPin);
                setNewPin("");
                setConfirmPin("");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Gagal memperbarui PIN");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1>Pengaturan</h1>
                <p>Kelola pengaturan sistem</p>
            </div>

            <div className="card" style={{ maxWidth: "600px" }}>
                <div className="card-header">
                    <h3 className="card-title">🔑 Universal PIN</h3>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: "16px" }}>{error}</div>}
                {success && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{success}</div>}

                <div style={{ marginBottom: "24px" }}>
                    <p style={{ fontSize: "14px", color: "#718096", marginBottom: "8px" }}>
                        PIN Aktif Saat Ini:
                    </p>
                    <div style={{ 
                        fontSize: "32px", 
                        fontWeight: "700", 
                        color: "#2d3748",
                        letterSpacing: "8px",
                        fontFamily: "monospace"
                    }}>
                        {currentPin || "------"}
                    </div>
                </div>

                <form onSubmit={handleUpdatePin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="form-group">
                        <label htmlFor="newPin">PIN Baru (6 digit)</label>
                        <input
                            id="newPin"
                            type="text"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                            disabled={loading}
                            style={{ 
                                fontSize: "20px", 
                                letterSpacing: "4px", 
                                fontFamily: "monospace",
                                textAlign: "center"
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPin">Konfirmasi PIN</label>
                        <input
                            id="confirmPin"
                            type="text"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                            disabled={loading}
                            style={{ 
                                fontSize: "20px", 
                                letterSpacing: "4px", 
                                fontFamily: "monospace",
                                textAlign: "center"
                            }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading || !newPin || !confirmPin}
                    >
                        {loading ? "Memperbarui..." : "Perbarui PIN"}
                    </button>
                </form>

                <div style={{ 
                    marginTop: "24px", 
                    padding: "12px", 
                    background: "#fef5e7", 
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#7d6608"
                }}>
                    <strong>⚠️ Perhatian:</strong> PIN ini digunakan sebagai fallback untuk membuka pintu melalui keypad ESP32.
                </div>
            </div>
        </div>
    );
}

// Tambahkan style untuk alert
const style = document.createElement("style");
style.textContent = `
.alert {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
}

.alert-error {
    background: #fed7d7;
    color: #c53030;
    border: 1px solid #fc8181;
}

.alert-success {
    background: #c6f6d5;
    color: #2f855a;
    border: 1px solid #68d391;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
}

.form-group input {
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
    background: #f7fafc;
    cursor: not-allowed;
}
`;
document.head.appendChild(style);
