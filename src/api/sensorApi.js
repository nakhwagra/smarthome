import axiosClient from "./axiosClient";
const sensorApi = {
    getAll: () => axiosClient.get("/sensor_logs"),
};
export default sensorApi;
