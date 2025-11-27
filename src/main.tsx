// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // tailwind + global css

import { AuthProvider } from "./context/AuthContext";

// Import test utilities for debugging
import "./utils/testBackend";

console.log("🚀 Smart Home IoT Frontend Started");
console.log("📝 To test backend connection, open console and run:");
console.log("   testBackendConnection()");
console.log("   testWebSocket()");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
