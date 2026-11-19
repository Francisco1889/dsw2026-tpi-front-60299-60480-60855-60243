import { instance } from '../../shared/api/axiosInstance';

export const loginAdmin = async (email, password) => {
  const response = await instance.post('/auth/admin/login', {
    email,
    password,
  });

  return response.data;
};
