// Configuration for API endpoints
// In local development, API_BASE is empty and Vite proxies /api to http://127.0.0.1:8000
// In production on Render, VITE_API_BASE_URL points to the backend web service URL
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
