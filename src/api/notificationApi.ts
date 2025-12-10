import axiosClient from "./axiosClient";

export interface Notification {
    notification_id: number;
    type: string; // "warning", "info", "alert"
    message: string;
    created_at: string;
    is_read: boolean;
}

export interface NotificationResponse {
    success: boolean;
    message: string;
    data: Notification[];
}

const notificationApi = {
    // Get all notifications
    getAll: () => axiosClient.get<NotificationResponse>("/notification/"),
    
    // Get notifications by type
    getByType: (type: "warning" | "info" | "alert") => axiosClient.get<NotificationResponse>(`/notification/type/${type}`),
    
    // Create new notification
    create: (payload: { type: string; message: string }) => axiosClient.post<NotificationResponse>("/notification/", payload),
};

export default notificationApi;
