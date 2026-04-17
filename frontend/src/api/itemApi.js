import api from './axios';

export const getItems = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/items${query ? '?' + query : ''}`);
};

export const getItemById = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const getStats = () => api.get('/items/stats');