import axiosClient from "./axiosClient";

export interface AccessLog {
    log_id: number;
    user_id?: number;
    access_method: string; // "face_recognition", "pin", "keypad", "remote"
    status: string; // "granted", "denied"
    timestamp: string;
    note?: string;
}

export interface AccessLogResponse {
    success: boolean;
    message: string;
    data: AccessLog[];
}

const accessLogApi = {
    // Get all access logs
    getAll: () => axiosClient.get<AccessLogResponse>("/access-log/"),
    
    // Get access logs by user ID
    getByUser: (userId: number) => axiosClient.get<AccessLogResponse>(`/access-log/user/${userId}`),
    
    // Get access logs by status (granted/denied)
    getByStatus: (status: "granted" | "denied") => axiosClient.get<AccessLogResponse>(`/access-log/status/${status}`),
    
    // Create new access log (usually called by backend, but available)
    create: (payload: Partial<AccessLog>) => axiosClient.post<AccessLogResponse>("/access-log/", payload),
};

export default accessLogApi;
