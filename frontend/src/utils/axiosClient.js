import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

const axiosClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Global response interceptor for 401 auth expiration
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const requestUrl = error.config?.url || '';
            // Do not trigger global auth:expired event for credentials failures on login or register
            const isAuthAttempt = requestUrl.includes('/user/login') || requestUrl.includes('/user/register');
            if (!isAuthAttempt && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:expired', { detail: error.response?.data }));
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Extracts a user-friendly error message from an axios error or fallback.
 * Checks in order: err.response.data.message -> err.response.data (if string) -> err.message -> "Something went wrong".
 * For 429 Too Many Requests, appends " Try again in X seconds." using retryAfterSeconds or Retry-After header.
 */
export const getApiErrorMessage = (err) => {
    if (!err) return "Something went wrong";

    let message = "";
    if (err.response?.data?.message && typeof err.response.data.message === 'string') {
        message = err.response.data.message;
    } else if (typeof err.response?.data === 'string' && err.response.data.trim()) {
        message = err.response.data.trim();
    } else if (err.message && typeof err.message === 'string') {
        message = err.message;
    } else {
        message = "Something went wrong";
    }

    if (err.response?.status === 429) {
        const retryAfterSeconds = err.response.data?.retryAfterSeconds ||
            err.response.headers?.['retry-after'] ||
            err.response.headers?.['Retry-After'];
        if (retryAfterSeconds) {
            const sec = Math.ceil(Number(retryAfterSeconds));
            if (!isNaN(sec) && sec > 0) {
                if (!message.toLowerCase().includes("try again")) {
                    message = `${message} Try again in ${sec} seconds.`;
                }
            }
        }

    }

    return message;
};

export default axiosClient;

