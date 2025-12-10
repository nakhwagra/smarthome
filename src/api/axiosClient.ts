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
  baseURL: "http://10.124.88.57:8080/api", // endpoint backend Go
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // Increase timeout for face processing
});

axiosClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Ignore localStorage errors
  }
  
  // Debug log untuk semua request
  console.log("📤 API Request:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    data: config.data
  });
  
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