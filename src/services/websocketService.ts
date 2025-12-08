// src/services/websocketService.ts

type MessageHandler = (data: any) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private url: string = "ws://localhost:8080/ws";
    private reconnectDelay: number = 3000;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private handlers: Map<string, MessageHandler[]> = new Map();
    private isConnecting: boolean = false;

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
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
                } catch (err) {
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
        } catch (err) {
            console.error("Failed to create WebSocket:", err);
            this.isConnecting = false;
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) return;

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

    private handleMessage(message: any) {
        const { type, data } = message;

        if (!type) {
            console.warn("Received message without type:", message);
            return;
        }

        const handlers = this.handlers.get(type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (err) {
                    console.error(`Error in handler for type ${type}:`, err);
                }
            });
        }
    }

    // Subscribe ke tipe message tertentu
    on(type: string, handler: MessageHandler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type)!.push(handler);
    }

    // Unsubscribe dari tipe message
    off(type: string, handler: MessageHandler) {
        const handlers = this.handlers.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Send message ke server (jika perlu)
    send(message: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket not connected, cannot send message");
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
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
