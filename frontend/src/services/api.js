import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifequest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and broadcast if expired
      localStorage.removeItem('lifequest_token');
      localStorage.removeItem('lifequest_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  pauseTask: (id) => api.post(`/tasks/${id}/pause`),
  resumeTask: (id) => api.post(`/tasks/${id}/resume`),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const instancesAPI = {
  getTodayInstances: () => api.get('/instances/today'),
  getInstancesForDate: (dateStr) => api.get(`/instances/date/${dateStr}`),
  completeInstance: (id) => api.post(`/instances/${id}/complete`),
  uncompleteInstance: (id) => api.post(`/instances/${id}/uncomplete`),
  updateInstance: (id, data) => api.put(`/instances/${id}`, data),
};

export const timersAPI = {
  getStatus: (instanceId) => api.get(`/timers/${instanceId}/status`),
  start: (instanceId) => api.post(`/timers/${instanceId}/start`),
  pause: (instanceId) => api.post(`/timers/${instanceId}/pause`),
  stop: (instanceId) => api.post(`/timers/${instanceId}/stop`),
};

export const skillsAPI = {
  getRadarData: () => api.get('/skills/radar'),
  getSkillsDetail: () => api.get('/skills/detail'),
  createSkill: (data) => api.post('/skills', data),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data),
  toggleSkillActive: (id) => api.post(`/skills/${id}/toggle`),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserActive: (userId) => api.post(`/admin/users/${userId}/toggle-active`),
  updateUserRole: (userId, data) => api.post(`/admin/users/${userId}/role`, data),
};

export const streaksAPI = {
  getStreakInfo: () => api.get('/streaks'),
};

export const restDaysAPI = {
  getRestDays: () => api.get('/rest-days'),
  addRestDay: (data) => api.post('/rest-days', data),
  removeRestDay: (dateStr) => api.delete(`/rest-days/${dateStr}`),
};

export const missionsAPI = {
  getTodayMission: () => api.get('/missions/today'),
  claimReward: () => api.post('/missions/today/claim'),
};

export const achievementsAPI = {
  getAchievements: () => api.get('/achievements'),
};

export const analyticsAPI = {
  getDaily: () => api.get('/analytics/daily'),
  getWeekly: () => api.get('/analytics/weekly'),
  getMonthly: () => api.get('/analytics/monthly'),
  getHeatmap: () => api.get('/analytics/heatmap'),
};

export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
};

export default api;
