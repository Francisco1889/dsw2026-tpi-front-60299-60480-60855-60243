import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import TablePagination from '../../shared/components/TablePagination';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { getDoctors } from '../../doctors/services/doctors';
import { getSpecialties } from '../../specialties/services/specialties';
import { getAppointmentsByDate } from '../../appointments/services/appointments';

const PAGE_SIZE = 10;

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return year + '-' + month + '-' + day;
}

function OverviewPage() {
  const [counts, setCounts] = useState(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState({ name: '', page: 1 });
  const [result, setResult] = useState(null);
  const [listError, setListError] = useState('');
  const [searchError, setSearchError] = useState('');
  const statsError = counts && Object.values(counts).includes(null);

  useEffect(() => {
    let current = true;

    async function loadCounts() {
      const [doctors, specialties, appointments] = await Promise.allSettled([
        getDoctors({ pageIndex: 0, pageSize: 1 }),
        getSpecialties({ pageIndex: 0, pageSize: 1 }),
        getAppointmentsByDate(getToday()),
      ]);

      if (!current) return;

      let confirmedToday = null;

      if (appointments.status === 'fulfilled') {
        confirmedToday = appointments.value.filter(
          (item) => item.status === 'BOOKED'
        ).length;
      }

      setCounts({
        doctors: doctors.status === 'fulfilled' ? doctors.value.total : null,
        specialties:
          specialties.status === 'fulfilled' ? specialties.value.total : null,
        appointments: confirmedToday,
      });
    }

    loadCounts();

    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    let current = true;

    async function loadDoctors() {
      setResult(null);
      setListError('');

      try {
        const data = await getDoctors({
          pageIndex: query.page - 1,
          pageSize: PAGE_SIZE,
          name: query.name || undefined,
        });

        if (!current) return;

        const lastPage = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

        if (query.page > lastPage) {
          setQuery({ ...query, page: lastPage });
        } else {
          setResult(data);
        }
      } catch (error) {
        if (current) {
          setListError(
            getApiErrorMessage(error, 'No se pudo cargar el directorio.')
          );
        }
      }
    }

    loadDoctors();

    return () => {
      current = false;
    };
  }, [query]);

  function searchByName(event) {
    event.preventDefault();

    const name = search.trim();

    if (name && (name.length < 3 || name.length > 100)) {
      setSearchError('Para buscar, ingresá entre 3 y 100 caracteres.');

      return;
    }

    setSearchError('');
    setQuery({ name, page: 1 });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header con Título y Acciones Principales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Vista General de Gestión
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Configure el personal médico y las especialidades del departamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/doctors/new"
            className="flex items-center gap-2 rounded-lg bg-med-primary-900 px-4 py-2 font-medium text-white hover:bg-med-primary-800"
          >
            <span>+</span>
            <span>Agregar Nuevo Doctor</span>
          </Link>

          <Link
            to="/admin/specialties/new"
            className="flex items-center gap-2 rounded-lg border border-med-primary-900 px-4 py-2 font-medium text-med-primary-900 hover:bg-med-primary-50"
          >
            <span>+</span>
            <span>Agregar Nueva Especialidad</span>
          </Link>
        </div>
      </div>

      {statsError && (
        <p role="alert" className="text-sm text-red-700">
          No se pudieron cargar todos los indicadores.
        </p>
      )}

      {/* Indicadores del tablero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Doctores Activos */}
        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-med-primary-50 text-med-primary-900 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>

          <div className="mt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">
              Médicos activos
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-med-primary-900 mt-1">
              {counts ? (counts.doctors ?? '—') : 'Cargando…'}
            </p>
          </div>
        </Card>

        {/* Especialidades Activas */}
        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-med-primary-50 text-med-primary-900 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
          </div>

          <div className="mt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">
              Especialidades activas
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-med-primary-900 mt-1">
              {counts ? (counts.specialties ?? '—') : 'Cargando…'}
            </p>
          </div>
        </Card>

        {/* Turnos Confirmados para Hoy */}
        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-med-primary-50 text-med-primary-900 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="mt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">
              Turnos confirmados para hoy
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-med-primary-900 mt-1">
              {counts ? (counts.appointments ?? '—') : 'Cargando…'}
            </p>
          </div>
        </Card>
      </div>

      {/* Directorio de Profesionales Médicos (Tabla Resumen) */}
      <Card className="p-0 overflow-hidden border-med-border">
        {/* Cabecera de la tabla con Buscador */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Directorio de Profesionales Médicos
          </h2>
          <form onSubmit={searchByName} className="flex flex-wrap gap-2">
            <input
              type="search"
              aria-label="Buscar por nombre"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-med-border px-3 py-2 sm:w-auto"
            />
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
        </div>

        {searchError && (
          <p role="alert" className="px-5 pt-4 text-sm text-red-700">
            {searchError}
          </p>
        )}
        {listError && (
          <p role="alert" className="p-5 text-sm text-red-700">
            {listError}
          </p>
        )}
        {!listError && !result && (
          <p role="status" className="p-5 text-sm text-med-text-sub">
            Cargando médicos…
          </p>
        )}
        {result && result.data.length === 0 && (
          <p className="p-5 text-sm text-med-text-sub">
            No se encontraron médicos.
          </p>
        )}
        {result && result.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
                <tr>
                  <th className="px-6 py-3.5">Nombre del Doctor</th>
                  <th className="px-6 py-3.5">Especialidad</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-med-border-subtle">
                {result.data.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-semibold text-med-primary-900">
                      {doctor.name}
                    </td>
                    <td className="px-6 py-4 text-med-text-sub">
                      {doctor.specialty.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/admin/doctors"
                        className="text-xs font-semibold text-med-primary-700 hover:text-med-primary-900"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {result && (
          <TablePagination
            currentPage={query.page}
            totalPages={Math.max(1, Math.ceil(result.total / PAGE_SIZE))}
            totalItems={result.total}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => setQuery({ ...query, page })}
          />
        )}
      </Card>
    </div>
  );
}

export default OverviewPage;
