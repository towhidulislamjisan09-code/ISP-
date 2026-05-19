// Smart API Base URL fallback
// If running in development viewport/sandbox container OR as localhost, fall back to relative path so it hits the live container backend.
// Otherwise, use the custom production Render backend URL.
const isLocalOrSandbox = 
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname.includes('run.app') ||
   window.location.hostname.includes('webcontainer') ||
   !window.location.hostname);

export const API_BASE_URL = isLocalOrSandbox 
  ? "/api" 
  : "https://isp-shoktinet.onrender.com/api";
