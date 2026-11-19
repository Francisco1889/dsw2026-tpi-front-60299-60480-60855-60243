import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import useAuth from '../../auth/hook/useAuth';
import { getApiErrorMessage } from '../../shared/api/apiError';
import {
  cancelAppointment,
  getPatientAppointments,
} from '../../appointments/services/appointments';

function AppointmentsPage() {
  const { dni } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cancelingId, setCancelingId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let current = true;

    async function loadAppointments() {
      setLoading(true);
      setError('');

      try {
        if (!dni) {
          setError('Volvé a iniciar sesión para consultar tus turnos.');

          return;
        }

        const result = await getPatientAppointments(dni);

        if (current) setAppointments(result);
      } catch (err) {
        if (current) {
          setError(
            getApiErrorMessage(err, 'No se pudieron cargar tus turnos.')
          );
        }
      } finally {
        if (current) setLoading(false);
      }
    }

    loadAppointments();

    return () => {
      current = false;
    };
  }, [dni, refresh]);

  async function handleCancel(appointment) {
    if (loading || cancelingId) return;

    if (!window.confirm('¿Querés cancelar este turno?')) return;

    setCancelingId(appointment.id);
    setError('');
    setMessage('');

    try {
      await cancelAppointment(appointment.id);
      setAppointments((current) =>
        current.filter((item) => item.id !== appointment.id)
      );
      setMessage('Turno cancelado.');
      setLoading(true);
      setRefresh((current) => current + 1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cancelar el turno.'));
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Mis Turnos Médicos
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Consulta y gestiona las citas médicas programadas.
          </p>
        </div>
        <Link
          to="/"
          className="rounded-lg bg-med-primary-900 px-4 py-2 font-medium text-white hover:bg-med-primary-800"
        >
          + Solicitar Nuevo Turno
        </Link>
      </div>

      {loading && <p role="status">Cargando turnos…</p>}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-green-800">
          {message}
        </p>
      )}
      {!loading && !error && appointments.length === 0 && (
        <p className="text-sm text-med-text-sub">No tenés turnos próximos.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {appointments.map((appt) => (
          <Card
            key={appt.id}
            className="flex flex-col justify-between gap-4 p-6"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
                  {appt.specialty}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-med-active-bg text-med-active-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  Confirmado
                </span>
              </div>
              <h3 className="text-lg font-bold text-med-primary-900">
                {appt.doctor}
              </h3>
              <p className="text-sm text-med-text-sub mt-2">
                Fecha:{' '}
                <strong className="text-med-text-main font-semibold">
                  {new Date(
                    appt.availableTime.date + 'T00:00'
                  ).toLocaleDateString('es-AR')}
                </strong>{' '}
                a las{' '}
                <strong className="text-med-text-main font-semibold">
                  {appt.availableTime.startTime} hs
                </strong>
              </p>
            </div>
            <div className="flex gap-2 pt-3 border-t border-med-border">
              <Button
                variant="outline"
                className="w-full text-xs disabled:opacity-50"
                disabled={loading || cancelingId !== null}
                onClick={() => handleCancel(appt)}
              >
                {cancelingId === appt.id ? 'Cancelando…' : 'Cancelar turno'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AppointmentsPage;
