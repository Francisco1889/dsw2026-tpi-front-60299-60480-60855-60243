import { instance } from '../../shared/api/axiosInstance';

export const loginPatient = async (email, dni) => {
  const response = await instance.post('/auth/patient/login', {
    email,
    dni: Number(dni),
  });

  return response.data;
};
