import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshAccessToken } = await import('../stores/authStore');
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setLanguageHeader = (lang) => {
  api.defaults.headers.common['Accept-Language'] = lang;
};

export default api;