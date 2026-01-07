

import axiosClient from "./axiosClient";

type LampControlPayload = { status: "on" | "off" };
type DoorControlPayload = { action: "lock" | "unlock" | "open" | "close" | "toggle"; pin_code?: string };
type CurtainControlPayload = { action: "open" | "close" | "stop" };
type BuzzerControlPayload = { action: "on" | "off"; duration_ms?: number };


export interface Device {
    id: number;
    name: string;
    type?: string;
    status?: "on" | "off";
    mqtt_topic?: string;
}

const deviceApi = {
    getLampLatest: () => axiosClient.get("/device/lamp/latest"),
    // get latest door status
    getDoorLatest: () => axiosClient.get("/device/door/latest"),
    // get latest curtain status
    getCurtainLatest: () => axiosClient.get("/device/curtain/latest"),

    // get history
    getLampHistory: () => axiosClient.get("/device/lamp/history"),
    getDoorHistory: () => axiosClient.get("/device/door/history"),

    // control endpoints (use control routes)
    toggleLamp: (payload: LampControlPayload) => axiosClient.post("/control/lamp", payload),
    controlDoor: (payload: DoorControlPayload) => axiosClient.post("/control/door", payload),
    controlCurtain: (payload: CurtainControlPayload) => axiosClient.post("/control/curtain", payload),
    controlBuzzer: (payload: BuzzerControlPayload) => axiosClient.post("/control/buzzer", payload),

    // door PIN verification
    verifyDoorPin: (payload: { pin_code: string }) => axiosClient.post("/device/door/verify-pin", payload),
};

export default deviceApi;
