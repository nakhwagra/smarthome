import axiosClient from "./axiosClient";

export interface PendingUser {
    user_id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
}

export interface User {
    user_id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'pending' | 'rejected';
    created_at: string;
    updated_at?: string;
}

export interface UniversalPin {
    pin_id: number;
    universal_pin: string;
    created_at: string;
    updated_at: string;
}

const adminApi = {
    // User Approval Management
    getPendingUsers: () => axiosClient.get<{ success: boolean; data: PendingUser[] }>("/admin/users/pending"),
    approveUser: (userId: number) => axiosClient.post<{ success: boolean; message: string }>(`/admin/users/${userId}/approve`, {}),
    rejectUser: (userId: number) => axiosClient.post<{ success: boolean; message: string }>(`/admin/users/${userId}/reject`, {}),

    // User CRUD Management
    getAllUsers: () => axiosClient.get<{ success: boolean; data: User[] }>("/user/"),
    getUserById: (userId: number) => axiosClient.get<{ success: boolean; data: User }>(`/user/${userId}`),
    deleteUser: (userId: number) => axiosClient.delete<{ success: boolean; message: string }>(`/user/${userId}`),

    // PIN Management
    getUniversalPin: () => axiosClient.get<{ success: boolean; data: UniversalPin }>("/admin/pin"),
    setUniversalPin: (pinCode: string, setBy: number) => {
        const payload = {
            universal_pin: pinCode,
            set_by: setBy
        };
        return axiosClient.post<{ success: boolean; message: string }>("/admin/pin", payload);
    },
};

export default adminApi;
