// import axiosClient from "./axiosClient";
// const deviceApi = {
//     getAll: () => axiosClient.get("/devices"),
//     getById: (id) => axiosClient.get(`/devices/${id}`),
//     updateStatus: (id, data) => axiosClient.patch(`/devices/${id}`, data),
//     create: (data) => axiosClient.post("/devices", data),
//     delete: (id) => axiosClient.delete(`/devices/${id}`),
// };
// export default deviceApi;
// import axiosClient from "./axiosClient";
// import type { AxiosResponse } from "axios";
// import type { Device } from "../components/DeviceCard";
// const deviceApi = {
//     getAll: (): Promise<AxiosResponse<Device[]>> => axiosClient.get("/device/status"),
//     getById: (id: number): Promise<AxiosResponse<Device>> =>
//         axiosClient.get(`/devices/${id}`),
//     updateStatus: (id: number, data: Partial<Device>): Promise<AxiosResponse<Device>> =>
//         axiosClient.patch(`/devices/${id}`, data),
//     create: (data: Partial<Device>): Promise<AxiosResponse<Device>> =>
//         axiosClient.post("/devices", data),
//     delete: (id: number): Promise<AxiosResponse<void>> =>
//         axiosClient.delete(`/devices/${id}`),
// };
// export default deviceApi;
import axiosClient from "./axiosClient";
// const deviceApi = {
//     getAll: () => axiosClient.get<Device[]>("/device/status"),
//     toggle: (id: number, nextStatus: "on" | "off") =>
//         axiosClient.patch(`/device/${id}/toggle`, { status: nextStatus }),
// };
const deviceApi = {
    // no single /device/status endpoint on backend — provide helpers
    // get latest lamp status
    getLampLatest: () => axiosClient.get("/device/lamp/latest"),
    // get latest door status
    getDoorLatest: () => axiosClient.get("/device/door/latest"),
    // get latest curtain status
    getCurtainLatest: () => axiosClient.get("/device/curtain/latest"),
    // control endpoints (use control routes)
    toggleLamp: (payload) => axiosClient.post("/control/lamp", payload),
    controlDoor: (payload) => axiosClient.post("/control/door", payload),
    controlCurtain: (payload) => axiosClient.post("/control/curtain", payload),
};
export default deviceApi;
