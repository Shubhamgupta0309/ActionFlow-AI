import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export const getMessages = async (params = {}) => {
  const res = await api.get('/messages/', { params });
  return res.data;
};

export const analyzeSingleMessage = async (messageId) => {
  const res = await api.post(`/messages/${messageId}/analyze`);
  return res.data;
};

export const analyzeAllMessages = async () => {
  const res = await api.post('/messages/analyze-all');
  return res.data;
};

export const uploadMessagesJSON = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/messages/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getTasks = async (params = {}) => {
  const res = await api.get('/tasks/', { params });
  return res.data;
};

export const updateTask = async (taskId, updates) => {
  const res = await api.patch(`/tasks/${taskId}`, updates);
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await api.delete(`/tasks/${taskId}`);
  return res.data;
};

export default api;