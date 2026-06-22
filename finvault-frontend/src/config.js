// Reads VITE_API_BASE_URL from a .env file if present (see .env.example),
// otherwise defaults to the backend's local dev address. Vite only exposes
// env vars prefixed with VITE_ to client code.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
