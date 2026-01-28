import axios from "axios";

/**
 * Keep baseURL empty so calls are same-origin in prod,
 * and in dev we’ll use Vite proxy (also same-origin).
 */
export const http = axios.create({
  baseURL: "",
  timeout: 15000,
  headers: {
    // Accept is fine (simple header) and helps servers that do content negotiation
    Accept: "application/json, text/plain, */*",
  },
});
