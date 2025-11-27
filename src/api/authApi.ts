import axiosClient from "./axiosClient";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user?: any;
}

const authApi = {
    login: (payload: LoginPayload) => axiosClient.post<LoginResponse>("/user/login", payload),
};

export default authApi;