import axios from 'axios';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { addNotification } = useUIStore.getState();
    const { logout } = useAuthStore.getState();

    if (error.response?.status === 401) {
      // Unauthorized - logout user
      logout();
      addNotification({
        type: 'error',
        title: 'Session Expired',
        message: 'Please log in again to continue.',
      });
    } else if (error.response?.status >= 500) {
      // Server error
      addNotification({
        type: 'error',
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      addNotification({
        type: 'error',
        title: 'Request Timeout',
        message: 'The request took too long. Please try again.',
      });
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (userData) => api.put('/api/auth/profile', userData),
  updatePassword: (passwordData) => api.put('/api/auth/password', passwordData),
};

// Session API
export const sessionAPI = {
  getSessions: (params = {}) => api.get('/api/sessions', { params }),
  getSession: (id) => api.get(`/api/sessions/${id}`),
  createSession: (sessionData) => api.post('/api/sessions', sessionData),
  updateSession: (id, sessionData) => api.put(`/api/sessions/${id}`, sessionData),
  deleteSession: (id) => api.delete(`/api/sessions/${id}`),
  getSessionMessages: (id, params = {}) => api.get(`/api/sessions/${id}/messages`, { params }),
  getRecentSessions: (params = {}) => api.get('/api/sessions/recent', { params }),
  duplicateSession: (id) => api.post(`/api/sessions/${id}/duplicate`),
};

// Chat API
export const chatAPI = {
  getModels: () => api.get('/api/chat/models'),
  generateComponent: (data) => api.post('/api/chat/generate', data),
  addMessage: (data) => api.post('/api/chat/message', data),
  getMessage: (id) => api.get(`/api/chat/messages/${id}`),
  updateMessage: (id, data) => api.put(`/api/chat/messages/${id}`, data),
  deleteMessage: (id) => api.delete(`/api/chat/messages/${id}`),
};

// Utility functions
export const handleAPIError = (error) => {
  try {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    } else if (error?.message) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else {
      return 'An unexpected error occurred';
    }
  } catch (e) {
    console.error('Error in handleAPIError:', e);
    return 'An unexpected error occurred';
  }
};

export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => formData.append(key, item));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return formData;
};

export default api;
