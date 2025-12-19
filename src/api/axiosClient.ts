// import axios from "axios";

// const axiosClient = axios.create({
//   baseURL: "http://localhost:4000", // JSON Server
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default axiosClient;

import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://ee6fe8f80d6f.ngrok-free.app/api", // endpoint backend Go via Ngrok
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // avoid Ngrok warning HTML
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