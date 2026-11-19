import axios from 'axios';

const SESSION_KEYS = ['token', 'role', 'dni'];

const clearSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

const instance = axios.create({
  baseURL: '/api',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && !isLoginRequest) {
      clearSession();

      const loginPath = window.location.pathname.startsWith('/admin')
        ? '/admin/login'
        : '/login';

      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export { instance, clearSession };
