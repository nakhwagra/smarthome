import axiosClient from "./axiosClient";

const sensorApi = {
    // Get sensor data
    getTemperature: () => axiosClient.get("/sensor/temperature"),
    getHumidity: () => axiosClient.get("/sensor/humidity"),
    getGas: () => axiosClient.get("/sensor/gas"),
    getLight: () => axiosClient.get("/sensor/light"),
    
    // Legacy - deprecated
    getAll: () => axiosClient.get("/sensor/temperature"), // fallback
};

export default sensorApi;