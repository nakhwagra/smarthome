import axiosClient from "./axiosClient";
import { User } from "./adminApi";

export interface UpdateProfileRequest {
    name: string;
    email: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}

const userApi = {
    // Get current user profile
    getProfile: (userId: number) =>
        axiosClient.get<{ success: boolean; data: User }>(`/user/${userId}`),

    // Update profile (name, email)
    updateProfile: (userId: number, data: UpdateProfileRequest) =>
        axiosClient.put<{ success: boolean; message: string; data: User }>(`/user/${userId}/profile`, data),

    // Change password
    changePassword: (userId: number, data: ChangePasswordRequest) =>
        axiosClient.put<{ success: boolean; message: string }>(`/user/${userId}/password`, data),

    // Re-enroll face
    reEnrollFace: (userId: number, imageBase64: string) =>
        axiosClient.post<{ success: boolean; message: string; data: User }>(`/user/${userId}/re-enroll-face`, { image: imageBase64 }),
};

export default userApi;
