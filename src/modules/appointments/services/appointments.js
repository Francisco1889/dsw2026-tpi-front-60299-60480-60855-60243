import { instance } from '../../shared/api/axiosInstance';

export async function createAppointment(appointment) {
  const response = await instance.post('/appointments', appointment);

  return response.data;
}

export async function getPatientAppointments(dni) {
  const response = await instance.get('/appointments/patient', {
    params: { dni },
  });

  return response.data;
}

export async function cancelAppointment(id) {
  await instance.delete('/appointments/' + id);
}
