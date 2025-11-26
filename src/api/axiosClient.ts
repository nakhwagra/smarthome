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
  baseURL: "http://localhost:4000", // sesuaikan
  headers: { "Content-Type": "application/json" },
});

export default axiosClient;
