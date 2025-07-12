import axios from 'axios';

// The base URL for all API requests. Can be set from environment variables.
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create an Axios instance with a base configuration.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // If a token exists, add it to the Authorization header.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // If an error occurs during the request setup, reject the promise.
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response, // If the response is successful, just pass it through.
  (error) => {
    // Check if the error is a 401 Unauthorized response.
    if (error.response?.status === 401) {
      console.error("Authentication Error: Token is invalid or expired. Logging out.");
      
      // Remove the invalid token from storage.
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- API Service Objects ---

export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  // ADMIN: Functions for user management
  getAllUsers: () => api.get('/users'),
  updateUserRole: (userId, role) => api.patch(`/users/${userId}/role`, { role }),
};

export const questionAPI = {
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  createQuestion: (data) => api.post('/questions', data),
  // ADMIN: Function to delete a question
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
};

export const answerAPI = {
  createAnswer: (data) => api.post('/answers', data),
  acceptAnswer: (id) => api.post(`/answers/${id}/accept`),
  // ADMIN: Function to delete an answer
  deleteAnswer: (id) => api.delete(`/answers/${id}`),
};

export const voteAPI = {
  vote: (data) => api.post('/votes', data),
};

export const tagAPI = {
  getTags: (params) => api.get('/tags', { params }),
  getPopularTags: () => api.get('/tags/popular'),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Export the configured Axios instance as the default export.
export default api;