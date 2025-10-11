import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const API_BASE = "https://g4a-portal-api.onrender.com/api/v1";

// Create axios instance
const httpClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Request interceptor to add auth token
httpClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const storedAuth = localStorage.getItem("campusbloom_auth");
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        if (parsed.accessToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${parsed.accessToken}`;
        }
      } catch {
        // Ignore parsing errors
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedAuth = localStorage.getItem("campusbloom_auth");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (parsed.refreshToken) {
            const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
              refreshToken: parsed.refreshToken,
            });

            if (refreshResponse.data?.success) {
              const authData = {
                ...parsed,
                accessToken: refreshResponse.data.accessToken,
              };
              localStorage.setItem("campusbloom_auth", JSON.stringify(authData));

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
              return httpClient(originalRequest);
            }
          }
        }
      } catch {
        // Refresh failed, redirect to login
        localStorage.removeItem("campusbloom_auth");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default httpClient;
