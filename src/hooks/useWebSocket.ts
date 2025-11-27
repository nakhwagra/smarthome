import { useEffect, useState, useRef } from "react";

interface WSMessage {
    [key: string]: any; // bisa diganti sesuai struktur data websocket-mu
}

// export default function useWebSocket(url: string) {
//     const [ws, setWs] = useState<WebSocket | null>(null);
//     const wsRef = useRef<WebSocket | null>(null); //messages, setMessages] = useState<WSMessage[]>([]);

//     useEffect(() => {
//         const socket = new WebSocket(url);
//         wsRef.current = socket;
//         setWs(socket);

//         socket.onopen = () => {
//             console.log("✅ WebSocket connected:", url);
//         };

//         socket.onopen = () => {
//             console.log("❌ WebSocket disconnected");
//         };

//         socket.onerror = (err: Event) => {
//             console.error("⚠️ WebSocket error", err);
//         };

//         return () => {
//             socket.close();
//         };
//     }, [url]);
//     return ws;
// }

export default function useWebSocket(url: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<string | null>(null);

    useEffect(() => {
        let socket: WebSocket;
        try {
            socket = new WebSocket(url);
            wsRef.current = socket;
        } catch (e) {
            console.error("WS init failed", e);
            return;
        }

        const onOpen = () => console.log("✅ WebSocket connected:", url);
        const onClose = (ev: CloseEvent) => console.log("❌ WebSocket disconnected", ev.reason);
        const onError = (ev: Event) => console.error("⚠️ WebSocket error", ev);
        const onMessage = (ev: MessageEvent) => setLastMessage(ev.data);

        socket.addEventListener("open", onOpen);
        socket.addEventListener("close", onClose);
        socket.addEventListener("error", onError);
        socket.addEventListener("message", onMessage);

        return () => {
            try {
                socket.removeEventListener("open", onOpen);
                socket.removeEventListener("close", onClose);
                socket.removeEventListener("error", onError);
                socket.removeEventListener("message", onMessage);
                socket.close();
            } catch { }
        };
    }, [url]);

    return lastMessage;
}