import axiosClient from "./axiosClient";

export interface AccessLog {
    access_id: number;
    user_id?: number | null;
    method: string; // "face", "pin", "remote"
    status: string; // "success", "failed"
    image_path?: string;
    timestamp: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
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
    
    // Get access logs by status (success/failed)
    getByStatus: (status: "success" | "failed") => axiosClient.get<AccessLogResponse>(`/access-log/status/${status}`),
    
    // Create new access log (usually called by backend, but available)
    create: (payload: Partial<AccessLog>) => axiosClient.post<AccessLogResponse>("/access-log/", payload),
};

export default accessLogApi;
