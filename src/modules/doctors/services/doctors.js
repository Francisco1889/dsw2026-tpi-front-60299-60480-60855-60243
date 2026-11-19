import { instance } from '../../shared/api/axiosInstance';

export async function getDoctors(params) {
  const response = await instance.get('/doctors', { params });

  return response.data;
}

export async function createDoctor(doctor) {
  const response = await instance.post('/doctors', doctor);

  return response.data;
}

export async function deleteDoctor(id) {
  await instance.delete('/doctors/' + id);
}

export async function getDoctorAvailability(id) {
  const response = await instance.get('/doctors/' + id + '/availabilities');

  return response.data;
}

export async function updateAvailability(availability) {
  const response = await instance.put('/availabilities', availability);

  return response.data;
}
