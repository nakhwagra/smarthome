import axiosClient from "./axiosClient";

export interface TemperatureReading {
    temp_id: number;
    temperature: number;
    timestamp: string;
}

export interface HumidityReading {
    humid_id: number;
    humidity: number;
    timestamp: string;
}

export interface GasReading {
    gas_id: number;
    ppm_value: number;
    status: string; // normal | warning | danger
    timestamp: string;
}

export interface LightReading {
    light_id: number;
    lux: number;
    timestamp: string;
}

const sensorApi = {
    getTemperature: (limit = 50) =>
        axiosClient.get<{ data: TemperatureReading[] }>("/sensor/temperature", { params: { limit } }),
    getHumidity: (limit = 50) =>
        axiosClient.get<{ data: HumidityReading[] }>("/sensor/humidity", { params: { limit } }),
    getGas: (limit = 50) =>
        axiosClient.get<{ data: GasReading[] }>("/sensor/gas", { params: { limit } }),
    getLight: (limit = 50) =>
        axiosClient.get<{ data: LightReading[] }>("/sensor/light", { params: { limit } }),
};

export default sensorApi;