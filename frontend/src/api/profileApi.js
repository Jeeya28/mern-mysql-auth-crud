import api from './axios';

export const getProfile = () => api.get('/profile');

export const updateProfile = (data) => api.put('/profile', data);

export const updatePassword = (data) => api.put('/profile/password', data);

export const uploadAvatar = (formData) =>
  api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteAvatar = () => api.delete('/profile/avatar');