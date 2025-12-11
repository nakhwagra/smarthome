import axiosClient from "./axiosClient";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    face_image?: string; // base64 image
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token?: string; // Direct token at root level
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
        status: string;
    };
    data?: {
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            status: string;
        };
    };
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data?: {
        user_id: number;
    };
}

const authApi = {
    login: (payload: LoginPayload) => axiosClient.post<LoginResponse>("/auth/login", payload),
    register: (payload: RegisterPayload) => axiosClient.post<RegisterResponse>("/auth/register", payload),
};

export default authApi;