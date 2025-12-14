import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { AuthContextType } from "../hooks/useAuth";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
	for (const prom of failedQueue) {
		if (error) {
		prom.reject(error);
		} else if (token) {
		prom.resolve(token);
		}
	}
	failedQueue = [];
};

export const configureAxios = (auth: AuthContextType) => {
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await auth.getAccessToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error getting access token:", error);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      // If we received a 401 error and haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If we're already refreshing, queue this request
          try {
            const newToken = await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
			console.log("Token expired, refreshing...");
			const newToken = await auth.refreshToken();
			
			if (newToken) {
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				processQueue(null, newToken);
				return api(originalRequest);
			}
			
			console.log("Token refresh failed, redirecting to login");
			const refreshError = new Error("Failed to refresh token");
			processQueue(refreshError, null);
			
			await auth.login();
			return Promise.reject(error);
		} catch (refreshError) {
			processQueue(refreshError, null);
			
			console.error("Critical authentication error:", refreshError);
			try {
				await auth.login();
			} catch (loginError) {
				console.error("Failed to redirect to login:", loginError);
			}
			
			return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

export default api;