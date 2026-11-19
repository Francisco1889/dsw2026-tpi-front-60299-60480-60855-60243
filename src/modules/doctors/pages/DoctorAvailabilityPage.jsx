import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { getDoctorAvailability } from '../services/doctors';

function DoctorAvailabilityPage() {
  const [params] = useSearchParams();
  const doctorId = params.get('doctorId');
  const { state } = useLocation();
  const [rules, setRules] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let current = true;

    async function load() {
      setRules(null);
      setError('');
      try {
        const data = await getDoctorAvailability(doctorId);

        if (current) setRules(data);
      } catch (err) {
        if (current)
          setError(getApiErrorMessage(err, 'No se pudo cargar la agenda.'));
      }
    }

    if (doctorId) load();

    return () => {
      current = false;
    };
  }, [doctorId, reload]);

  return (
    <div className="flex flex-col gap-4">
      <Link to="/admin/doctors" className="text-med-primary-700 underline">
        Volver al directorio de médicos
      </Link>
      <h1 className="text-2xl font-bold">
        {state?.name ? 'Agenda de ' + state.name : 'Agenda médica'}
      </h1>
      <Card>
        {!doctorId && (
          <p>
            Seleccioná un médico desde el directorio para consultar su agenda.
          </p>
        )}
        {doctorId && !error && !rules && <p role="status">Cargando agenda…</p>}
        {error && (
          <div role="alert">
            {error}{' '}
            <Button
              variant="outline"
              onClick={() => setReload((value) => value + 1)}
            >
              Reintentar
            </Button>
          </div>
        )}
        {doctorId && rules?.length === 0 && (
          <p>Sin horarios configurados para este mes.</p>
        )}
        {doctorId && rules?.length > 0 && (
          <ul className="divide-y divide-med-border">
            {rules.map((rule) => (
              <li className="py-2" key={rule.id}>
                {rule.day} · {rule.startTime} a {rule.endTime}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default DoctorAvailabilityPage;
