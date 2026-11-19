import { instance } from '../../shared/api/axiosInstance';

export async function getSpecialties(params) {
  const response = await instance.get('/specialties', { params });

  return response.data;
}

export async function createSpecialty(specialty) {
  const response = await instance.post('/specialties', specialty);

  return response.data;
}

export async function deleteSpecialty(id) {
  await instance.delete('/specialties/' + id);
}
