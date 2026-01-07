import axiosClient from "./axiosClient";

export interface User {
    user_id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'pending' | 'rejected';
    created_at: string;
    updated_at?: string;
    face_encoding_path?: string;
}

export interface UpdateUserRequest {
    name: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'pending' | 'rejected';
}

const adminApi = {
    // Universal PIN Management
    getUniversalPin: () => axiosClient.get<{ success: boolean; data: { pin: string } }>("/admin/pin"),
    updateUniversalPin: (pin: string) => axiosClient.put<{ success: boolean; message: string }>("/admin/pin", { pin }),

    // Pending User Management
    getPendingUsers: () => axiosClient.get<{ success: boolean; data: User[] }>("/admin/users/pending"),
    approveUser: (userId: number) => axiosClient.post<{ success: boolean; message: string }>(`/admin/users/${userId}/approve`, {}),
    rejectUser: (userId: number) => axiosClient.post<{ success: boolean; message: string }>(`/admin/users/${userId}/reject`, {}),

    // User CRUD Management
    getAllUsers: () => axiosClient.get<{ success: boolean; data: User[] }>("/user/"),
    getUserById: (userId: number) => axiosClient.get<{ success: boolean; data: User }>(`/user/${userId}`),
    updateUser: (userId: number, data: UpdateUserRequest) => axiosClient.put<{ success: boolean; message: string; data: User }>(`/user/${userId}`, data),
    deleteUser: (userId: number) => axiosClient.delete<{ success: boolean; message: string }>(`/user/${userId}`),
};

export default adminApi;
