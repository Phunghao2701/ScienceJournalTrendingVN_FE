import api from '../../../shared/services/api';

export const getProfileApi = async () => {
  try {
    return await api.get('/users/me');
  } catch (error) {
    if (error.response?.status === 404) {
      return api.get('/users/profile');
    }
    throw error;
  }
};

export const updateProfileApi = (data) => {
  return api.put('/users/me', data);
};

export const deleteProfileApi = () => {
  return api.delete('/users/me');
};
