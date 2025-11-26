// import axiosClient from "./axiosClient";

// const deviceApi = {
//     getAll: () => axiosClient.get("/devices"),
//     getById: (id) => axiosClient.get(`/devices/${id}`),
//     updateStatus: (id, data) => axiosClient.patch(`/devices/${id}`, data),
//     create: (data) => axiosClient.post("/devices", data),
//     delete: (id) => axiosClient.delete(`/devices/${id}`),
// };

// export default deviceApi;

import axiosClient from "./axiosClient";
import type { AxiosResponse } from "axios";
import type { Device } from "../components/DeviceCard";

const deviceApi = {
    getAll: (): Promise<AxiosResponse<Device[]>> => axiosClient.get("/devices"),
    getById: (id: number): Promise<AxiosResponse<Device>> =>
        axiosClient.get(`/devices/${id}`),
    updateStatus: (id: number, data: Partial<Device>): Promise<AxiosResponse<Device>> =>
        axiosClient.patch(`/devices/${id}`, data),
    create: (data: Partial<Device>): Promise<AxiosResponse<Device>> =>
        axiosClient.post("/devices", data),
    delete: (id: number): Promise<AxiosResponse<void>> =>
        axiosClient.delete(`/devices/${id}`),
};

export default deviceApi;
