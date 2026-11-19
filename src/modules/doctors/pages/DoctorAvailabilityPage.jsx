import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import {
  getDoctors,
  getDoctorAvailability,
  updateAvailability,
} from '../services/doctors';

const DAYS = [
  'LUNES',
  'MARTES',
  'MIÉRCOLES',
  'JUEVES',
  'VIERNES',
  'SÁBADO',
  'DOMINGO',
];

function DoctorAvailabilityPage() {
  const [params, setParams] = useSearchParams();
  const doctorId = params.get('doctorId');
  const [doctors, setDoctors] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadDoctors() {
      try {
        const result = await getDoctors({ pageIndex: 0, pageSize: 100 });
        setDoctors(result.data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'No se pudieron cargar los médicos.'));
      }
    }

    loadDoctors();
  }, []);

  useEffect(() => {
    async function loadAgenda() {
      setRanges([]);
      setError('');
      setMessage('');
      try {
        const result = await getDoctorAvailability(doctorId);
        setRanges(result);
      } catch (err) {
        setError(getApiErrorMessage(err, 'No se pudo cargar la agenda.'));
      }
    }

    if (doctorId) loadAgenda();
  }, [doctorId]);

  const doctor = doctors.find((item) => item.id === doctorId);

  function toggleDay(day, active) {
    if (active) {
      setRanges([...ranges, { day, startTime: '08:00', endTime: '16:00' }]);
    } else {
      setRanges(ranges.filter((range) => range.day !== day));
    }
  }

  function changeRange(index, field, value) {
    const copy = [...ranges];
    copy[index] = { ...copy[index], [field]: value };
    setRanges(copy);
  }

  async function save() {
    setError('');
    setMessage('');

    for (const range of ranges) {
      if (range.startTime >= range.endTime) {
        setError(range.day + ': la entrada debe ser antes que la salida.');
        return;
      }
    }

    try {
      await updateAvailability({ doctorId, days: ranges });
      setMessage('Agenda guardada.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar la agenda.'));
    }
  }

  const fieldClass = 'rounded-lg border border-med-border px-3 py-2';

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-med-text-sub">
        <Link to="/admin/doctors">Doctores</Link> &gt; Disponibilidad Horaria
      </p>
      <div>
        <h1 className="text-2xl font-bold">
          Gestionar Disponibilidad Horaria
        </h1>
        <p className="text-med-text-sub">
          Defina los días y rangos horarios de atención para el profesional
          seleccionado.
        </p>
      </div>

      {error && <p className="text-red-700">{error}</p>}
      {message && <p className="text-green-700">{message}</p>}

      <div className="grid items-start gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <label className="flex flex-col gap-1">
              Seleccionar Profesional
              <select
                className={fieldClass}
                value={doctorId ?? ''}
                onChange={(e) => setParams({ doctorId: e.target.value })}
              >
                <option value="">Elegí un médico</option>
                {doctors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            {doctor && (
              <div className="mt-4 rounded-lg bg-med-primary-50 p-3">
                <p className="font-semibold">{doctor.name}</p>
                <p className="text-sm">Matrícula: {doctor.licenseNumber}</p>
                <p className="text-sm">{doctor.specialty?.name}</p>
              </div>
            )}
          </Card>
          <Card>
            <p className="text-sm">
              Los cambios se aplican a los días que quedan del mes actual. Las
              citas ya programadas no se ven afectadas.
            </p>
          </Card>
        </div>

        {doctorId && (
          <Card>
            <div className="mb-4 flex flex-wrap justify-between gap-2">
              <h2 className="font-semibold">Configuración de Horarios</h2>
              <span className="text-sm text-med-text-sub">
                Intervalos automáticos de 30 minutos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-med-primary-50 text-sm">
                  <tr>
                    <th className="p-3">DÍA</th>
                    <th className="p-3">ESTADO</th>
                    <th className="p-3">ENTRADA</th>
                    <th className="p-3">SALIDA</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => {
                    const index = ranges.findIndex((r) => r.day === day);
                    const range = ranges[index];

                    return (
                      <tr key={day} className="border-b">
                        <td className="p-3 capitalize">
                          {day.toLowerCase()}
                        </td>
                        <td className="p-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={index !== -1}
                              onChange={(e) =>
                                toggleDay(day, e.target.checked)
                              }
                            />
                            {range ? 'Activo' : 'Inactivo'}
                          </label>
                        </td>
                        <td className="p-3">
                          <input
                            type="time"
                            step="1800"
                            className={fieldClass}
                            disabled={!range}
                            value={range ? range.startTime : ''}
                            onChange={(e) =>
                              changeRange(index, 'startTime', e.target.value)
                            }
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="time"
                            step="1800"
                            className={fieldClass}
                            disabled={!range}
                            value={range ? range.endTime : ''}
                            onChange={(e) =>
                              changeRange(index, 'endTime', e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <Link
                to="/admin/doctors"
                className="rounded-lg border border-med-border px-4 py-2"
              >
                Cancelar
              </Link>
              <Button onClick={save}>Guardar Disponibilidad</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default DoctorAvailabilityPage;
