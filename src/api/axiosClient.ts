import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://192.168.1.85:8080/api", // Backend Go on LAN
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Increase timeout for face processing
});

axiosClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Ignore localStorage errors
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR →", error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;