import axiosClient from "./axiosClient";

export interface FaceRecognizePayload {
    image: string; // base64 encoded image
}

export interface FaceRecognizeResponse {
    success: boolean;
    message: string;
    recognized: boolean;
    user_id?: number;
    name?: string;
    confidence?: number;
}

export interface FaceEnrollPayload {
    user_id: number;
    name: string;
    image: string; // base64 encoded image
}

export interface FaceEnrollResponse {
    success: boolean;
    message: string;
    data?: {
        user_id: number;
        name: string;
        encoding_path: string;
    };
}

const faceApi = {
    // Recognize face from image (typically called by ESP32-CAM)
    recognize: (payload: FaceRecognizePayload) => 
        axiosClient.post<FaceRecognizeResponse>("/face/recognize", payload),
    
    // Enroll new face
    enroll: (payload: FaceEnrollPayload) => 
        axiosClient.post<FaceEnrollResponse>("/face/enroll", payload),
    
    // Reload known faces (refresh Python service cache)
    reload: () => 
        axiosClient.post<{ success: boolean; message: string }>("/face/reload", {}),
    
    // Get face recognition access logs
    getLogs: () => 
        axiosClient.get<{ success: boolean; data: any[] }>("/face/logs"),
};

export default faceApi;
