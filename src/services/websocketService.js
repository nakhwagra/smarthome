// src/services/websocketService.ts
class WebSocketService {
    constructor() {
        this.ws = null;
        this.url = "ws://10.124.88.57:8080/api/ws";
        this.reconnectDelay = 3000;
        this.reconnectTimer = null;
        this.handlers = new Map();
        this.isConnecting = false;
    }
    connect() {
        var _a;
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN || this.isConnecting) {
            return;
        }
        this.isConnecting = true;
        console.log("🔌 Connecting to WebSocket...");
        try {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = () => {
                console.log("✅ WebSocket connected");
                this.isConnecting = false;
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
            };
            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                }
                catch (err) {
                    console.error("Failed to parse WebSocket message:", err);
                }
            };
            this.ws.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
                this.isConnecting = false;
            };
            this.ws.onclose = () => {
                console.log("🔌 WebSocket disconnected");
                this.isConnecting = false;
                this.scheduleReconnect();
            };
        }
        catch (err) {
            console.error("Failed to create WebSocket:", err);
            this.isConnecting = false;
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        console.log(`⏳ Reconnecting in ${this.reconnectDelay / 1000}s...`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, this.reconnectDelay);
    }
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.handlers.clear();
        console.log("🔌 WebSocket disconnected manually");
    }
    handleMessage(message) {
        const { type, data } = message;
        // Handle typed messages
        if (type) {
            const handlers = this.handlers.get(type);
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler(data);
                    }
                    catch (err) {
                        console.error(`Error in handler for type ${type}:`, err);
                    }
                });
            }
            return;
        }
        // Handle raw sensor data (from MQTT broadcast)
        const rawMessage = message;
        // Emit temperature if present
        if (rawMessage.temperature !== undefined) {
            const handlers = this.handlers.get("temperature");
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler({ value: rawMessage.temperature });
                    }
                    catch (err) {
                        console.error("Error in temperature handler:", err);
                    }
                });
            }
        }
        // Emit humidity if present
        if (rawMessage.humidity !== undefined) {
            const handlers = this.handlers.get("humidity");
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler({ value: rawMessage.humidity });
                    }
                    catch (err) {
                        console.error("Error in humidity handler:", err);
                    }
                });
            }
        }
        // Emit gas if present
        if (rawMessage.gas_ppm !== undefined) {
            const handlers = this.handlers.get("gas");
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler({ value: rawMessage.gas_ppm });
                    }
                    catch (err) {
                        console.error("Error in gas handler:", err);
                    }
                });
            }
        }
        // Emit light if present (handle both light_lux and lux)
        if (rawMessage.light_lux !== undefined || rawMessage.lux !== undefined) {
            const handlers = this.handlers.get("light");
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler({ value: rawMessage.light_lux || rawMessage.lux });
                    }
                    catch (err) {
                        console.error("Error in light handler:", err);
                    }
                });
            }
        }
        // Emit curtain if present
        if (rawMessage.curtain !== undefined) {
            const handlers = this.handlers.get("curtain");
            if (handlers) {
                handlers.forEach(handler => {
                    try {
                        handler({ status: rawMessage.curtain });
                    }
                    catch (err) {
                        console.error("Error in curtain handler:", err);
                    }
                });
            }
        }
        if (!type && !rawMessage.temperature && !rawMessage.humidity && !rawMessage.gas_ppm && !rawMessage.light_lux && !rawMessage.lux && !rawMessage.curtain) {
            console.warn("Received unknown message:", message);
        }
    }
    // Subscribe ke tipe message tertentu
    on(type, handler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type).push(handler);
    }
    // Unsubscribe dari tipe message
    off(type, handler) {
        const handlers = this.handlers.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    // Send message ke server (jika perlu)
    send(message) {
        var _a;
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            console.warn("WebSocket not connected, cannot send message");
        }
    }
    isConnected() {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN;
    }
}
// Singleton instance
const websocketService = new WebSocketService();
export default websocketService;
// Message types yang dikirim dari backend Go
export const WS_TYPES = {
    TEMPERATURE: "temperature",
    HUMIDITY: "humidity",
    GAS: "gas",
    LIGHT: "light",
    DOOR_STATUS: "door_status",
    LAMP_STATUS: "lamp_status",
    CURTAIN_STATUS: "curtain_status",
    BUZZER_LOG: "buzzer_log",
    ACCESS_LOG: "access_log",
    FACE_RECOGNITION: "face_recognition",
    NOTIFICATION: "notification",
};
