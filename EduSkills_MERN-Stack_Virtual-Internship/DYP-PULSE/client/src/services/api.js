import axios from 'axios';

// Dynamic Base URL calculation
export const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.');

    // Custom runtime override in browser (e.g. for testing)
    const storedUrl = localStorage.getItem('dypulse_api_url');
    if (storedUrl) return storedUrl;

    // If deployed on Vercel or any remote domain, but VITE_API_URL points to localhost, ignore it
    if (!isLocalhost && envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      console.warn('[DYPULSE API] Overrode invalid localhost VITE_API_URL in production deployment.');
      return '/api/v1';
    }

    if (envUrl) return envUrl;

    return isLocalhost ? 'http://localhost:5000/api/v1' : '/api/v1';
  }

  return envUrl || '/api/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Response Interceptor - standardize error handling
api.interceptors.response.use(
  (response) => {
    // Detect HTML responses sent instead of JSON (e.g. Vercel SPA rewrite fallback when API URL is not set)
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype html') || response.data.trim().startsWith('<html'))
    ) {
      const htmlError = new Error(
        'Received HTML response instead of JSON API response. Backend may be offline or VITE_API_URL unconfigured.'
      );
      htmlError.status = 502;
      htmlError.code = 'INVALID_JSON_RESPONSE';
      htmlError.isNetworkError = true;
      return Promise.reject(htmlError);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    let serverMessage = error.response?.data?.error?.message;
    let code = error.response?.data?.error?.code;

    const isNetworkError =
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      !error.response;

    if (status === 405) {
      serverMessage = 'API endpoint not available on this host. Switched to resilient student mode.';
      code = 'VERCEL_PROXY_405';
    } else if (isNetworkError) {
      serverMessage = 'Network Error: Backend may be starting up.';
      code = 'NETWORK_ERROR';
    }

    const message = serverMessage || error.message || 'An unexpected error occurred.';

    const customError = new Error(message);
    customError.status = status || (isNetworkError ? 503 : 500);
    customError.code = code;
    customError.isNetworkError = isNetworkError || status === 405;
    customError.details = error.response?.data?.error?.details;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

// Convenience helpers
export const get = async (url, params = {}, config = {}) => {
  const response = await api.get(url, { params, ...config });
  return response.data;
};

export const post = async (url, data = {}, config = {}) => {
  const response = await api.post(url, data, config);
  return response.data;
};

export const put = async (url, data = {}, config = {}) => {
  const response = await api.put(url, data, config);
  return response.data;
};

export const patch = async (url, data = {}, config = {}) => {
  const response = await api.patch(url, data, config);
  return response.data;
};

export const del = async (url, config = {}) => {
  const response = await api.delete(url, config);
  return response.data;
};

export default api;
