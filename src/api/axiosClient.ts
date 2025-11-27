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
  baseURL: "http://localhost:8080/api", // endpoint backend Go
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

axiosClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch { }
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
