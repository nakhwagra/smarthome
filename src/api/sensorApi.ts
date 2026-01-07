import axiosClient from "./axiosClient";

export interface SensorStats {
    avg: number;
    min: number;
    max: number;
    median: number;
    std_dev: number;
    count: number;
}

export interface SensorStatsResponse {
    temperature: SensorStats;
    humidity: SensorStats;
    time_range: string;
    start_time: string;
    end_time: string;
}

export interface CombinedSensorData {
    timestamp: string;
    temperature: number;
    humidity: number;
}

export interface SensorDataResponse {
    data: CombinedSensorData[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface HourlyData {
    hour: number;
    avg_temp: number;
    avg_humidity: number;
    min_temp: number;
    max_temp: number;
    min_humidity: number;
    max_humidity: number;
    count: number;
}

const sensorApi = {
    // Get statistics for a time range
    getStatistics: (timeRange: string = "24h") =>
        axiosClient.get<{ success: boolean; data: SensorStatsResponse }>(`/sensor/stats?range=${timeRange}`),

    // Get paginated sensor data
    getPaginatedData: (timeRange: string = "24h", page: number = 1, pageSize: number = 50) =>
        axiosClient.get<{ success: boolean; data: SensorDataResponse }>(
            `/sensor/data?range=${timeRange}&page=${page}&page_size=${pageSize}`
        ),

    // Get hourly aggregated data
    getHourlyData: (timeRange: string = "24h") =>
        axiosClient.get<{ success: boolean; data: HourlyData[] }>(`/sensor/hourly?range=${timeRange}`),

    // Existing endpoints (keep for compatibility)
    getTemperature: () => axiosClient.get("/sensor/temperature"),
    getHumidity: () => axiosClient.get("/sensor/humidity"),
    getGas: () => axiosClient.get("/sensor/gas"),
    getLight: () => axiosClient.get("/sensor/light"),
};

export default sensorApi;