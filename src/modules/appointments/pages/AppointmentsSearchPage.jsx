import { useEffect, useState } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import TablePagination from '../../shared/components/TablePagination';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { getSpecialties } from '../../specialties/services/specialties';
import { getDoctors } from '../../doctors/services/doctors';
import { searchAppointments } from '../services/appointments';

const PAGE_SIZE = 10;

const EMPTY_FILTERS = { dni: '', specialtyId: '', doctorId: '', date: '' };

const STATUS = {
  BOOKED: {
    text: 'Confirmado',
    className: 'bg-med-active-bg text-med-active-text',
  },
  CANCELLED: {
    text: 'Cancelado',
    className: 'bg-med-danger-bg text-med-danger-text',
  },
  ATTENDED: { text: 'Atendido', className: 'bg-slate-100 text-slate-700' },
  NO_SHOW: { text: 'Ausente', className: 'bg-amber-50 text-amber-700' },
};

function formatDate(text) {
  const [year, month, day] = text.split('-');

  return day + '/' + month + '/' + year;
}

function AppointmentsSearchPage() {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const specialtiesResult = await getSpecialties({
          pageIndex: 0,
          pageSize: 100,
        });
        const doctorsResult = await getDoctors({ pageIndex: 0, pageSize: 100 });

        setSpecialties(specialtiesResult.data);
        setDoctors(doctorsResult.data);
      } catch (err) {
        setFormError(
          getApiErrorMessage(err, 'No se pudieron cargar las opciones.')
        );
      }
    }

    loadOptions();
  }, []);

  useEffect(() => {
    let current = true;

    async function loadAppointments() {
      setResult(null);
      setError('');

      const params = { pageIndex: page - 1, pageSize: PAGE_SIZE };

      if (filters.dni) {
        params.dni = filters.dni;
      }

      if (filters.specialtyId) {
        params.specialtyId = filters.specialtyId;
      }

      if (filters.doctorId) {
        params.doctorId = filters.doctorId;
      }

      if (filters.date) {
        params.date = filters.date;
      }

      try {
        const data = await searchAppointments(params);

        if (current) {
          setResult(data);
        }
      } catch (err) {
        if (current) {
          setError(getApiErrorMessage(err, 'No se pudieron buscar las citas.'));
        }
      }
    }

    loadAppointments();

    return () => {
      current = false;
    };
  }, [filters, page]);

  function changeField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function changeSpecialty(event) {
    setForm({ ...form, specialtyId: event.target.value, doctorId: '' });
  }

  function applyFilters(event) {
    event.preventDefault();

    if (form.dni && !/^\d{7,10}$/.test(form.dni)) {
      setFormError('El DNI debe tener entre 7 y 10 números, sin puntos.');

      return;
    }

    setFormError('');
    setFilters({ ...form });
    setPage(1);
  }

  function clearFilters() {
    setForm(EMPTY_FILTERS);
    setFormError('');
    setFilters({ ...EMPTY_FILTERS });
    setPage(1);
  }

  const doctorOptions = form.specialtyId
    ? doctors.filter((doctor) => doctor.specialty.id === form.specialtyId)
    : doctors;
  const fieldClass =
    'w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
          Búsqueda y Filtrado de Citas
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Gestione y supervise el flujo de pacientes del departamento.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-bold text-med-primary-900 pb-4 border-b border-med-border-subtle">
          Criterios de Búsqueda
        </h2>

        <form
          onSubmit={applyFilters}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4 items-end"
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-med-text-sub">
            DNI del Paciente
            <input
              type="text"
              name="dni"
              inputMode="numeric"
              placeholder="Ej: 40123456"
              value={form.dni}
              onChange={changeField}
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-med-text-sub">
            Especialidad
            <select
              name="specialtyId"
              value={form.specialtyId}
              onChange={changeSpecialty}
              className={fieldClass}
            >
              <option value="">Todas las especialidades</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-med-text-sub">
            Doctor
            <select
              name="doctorId"
              value={form.doctorId}
              onChange={changeField}
              className={fieldClass}
            >
              <option value="">Todos los doctores</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-med-text-sub">
            Fecha
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={changeField}
              className={fieldClass}
            />
          </label>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </form>

        {formError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {formError}
          </p>
        )}
      </Card>

      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Citas
          </h2>
        </div>

        {error && (
          <p role="alert" className="p-5 text-sm text-red-700">
            {error}
          </p>
        )}

        {!error && !result && (
          <p role="status" className="p-5 text-sm text-med-text-sub">
            Buscando citas…
          </p>
        )}

        {result && result.data.length === 0 && (
          <p className="p-5 text-sm text-med-text-sub">
            No se encontraron citas con esos filtros.
          </p>
        )}

        {result && result.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
                <tr>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Especialidad</th>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-med-border-subtle">
                {result.data.map((item) => {
                  const status = STATUS[item.appointmentsStatus];
                  const patientName = item.patient.fullName?.trim();

                  return (
                    <tr key={item.appointmentsId}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-med-primary-900">
                          {formatDate(item.availableTime.date)}
                        </p>
                        <p className="text-xs text-med-text-muted mt-0.5">
                          {item.availableTime.startTime} a{' '}
                          {item.availableTime.endTime} hs
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-med-primary-900">
                          {item.doctor.specialty.name}
                        </p>
                        <p className="text-xs text-med-text-muted">
                          {item.doctor.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {patientName && (
                          <p className="font-semibold text-med-text-main">
                            {patientName}
                          </p>
                        )}
                        <p
                          className={
                            patientName
                              ? 'text-xs text-med-text-muted mt-0.5'
                              : 'font-semibold text-med-text-main'
                          }
                        >
                          DNI: {item.patient.dni}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={
                            'inline-block px-3 py-1 rounded-full text-xs font-semibold ' +
                            status.className
                          }
                        >
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {result && (
          <TablePagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(result.total / PAGE_SIZE))}
            totalItems={result.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}

export default AppointmentsSearchPage;
