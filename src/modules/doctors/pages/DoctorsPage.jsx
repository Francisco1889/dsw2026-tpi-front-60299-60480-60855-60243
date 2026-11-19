import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import TablePagination from '../../shared/components/TablePagination';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { deleteDoctor, getDoctors } from '../services/doctors';

const pageSize = 10;

function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [listError, setListError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let current = true;

    async function load() {
      setListError('');
      setResult(null);

      try {
        const data = await getDoctors({
          pageIndex: page - 1,
          pageSize,
          name: name || undefined,
        });
        const lastPage = Math.max(1, Math.ceil(data.total / pageSize));

        if (current) {
          if (page > lastPage) {
            setPage(lastPage);
          } else {
            setResult(data);
          }
        }
      } catch (error) {
        if (current) {
          setListError(
            getApiErrorMessage(error, 'No se pudo cargar el listado.')
          );
        }
      }
    }

    load();

    return () => {
      current = false;
    };
  }, [page, name, refresh]);

  function searchByName(event) {
    event.preventDefault();

    const term = search.trim();

    if (term && (term.length < 3 || term.length > 100)) {
      setActionError('Para buscar, ingresá entre 3 y 100 caracteres.');

      return;
    }

    setActionError('');
    setName(term);
    setPage(1);
    setRefresh((value) => value + 1);
  }

  async function remove(doctor) {
    if (!window.confirm('¿Eliminar al médico ' + doctor.name + '?')) {
      return;
    }

    setDeleting(true);
    setActionError('');

    try {
      await deleteDoctor(doctor.id);
      setRefresh((value) => value + 1);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'No se pudo eliminar al médico.')
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-med-text-main">
          Directorio de médicos
        </h1>
        <form onSubmit={searchByName} className="flex flex-wrap gap-2">
          <input
            type="search"
            aria-label="Buscar por nombre"
            placeholder="Buscar por nombre"
            className="w-full rounded-lg border border-med-border px-3 py-2 sm:w-auto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>
        <Link
          to="/admin/doctors/new"
          className="rounded-lg bg-med-primary-900 px-4 py-2 font-medium text-white"
        >
          Nuevo médico
        </Link>
      </div>
      {actionError && (
        <p role="alert" className="text-red-700">
          {actionError}
        </p>
      )}
      <Card className="overflow-hidden">
        <h2 className="mb-4 font-bold text-med-primary-900">
          Registros de médicos
        </h2>
        {listError && (
          <div role="alert">
            {listError}{' '}
            <Button
              variant="outline"
              onClick={() => setRefresh((value) => value + 1)}
            >
              Reintentar
            </Button>
          </div>
        )}
        {!listError && !result && <p role="status">Cargando médicos…</p>}
        {result && (
          <>
            {result.data.length === 0 ? (
              <p className="py-4">No se encontraron médicos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-med-primary-50 text-med-text-sub">
                    <tr>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Especialidad</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-med-border">
                    {result.data.map((doctor) => (
                      <tr key={doctor.id}>
                        <th scope="row" className="p-3 text-med-primary-900">
                          {doctor.name}
                          <span className="block text-xs font-normal text-med-text-sub">
                            Matrícula {doctor.licenseNumber}
                          </span>
                        </th>
                        <td className="p-3">{doctor.specialty.name}</td>
                        <td className="p-3">
                          <Link
                            className="mr-3 text-med-primary-700 underline"
                            to={
                              '/admin/doctors/availability?doctorId=' +
                              doctor.id
                            }
                            state={{ name: doctor.name }}
                          >
                            Agenda
                          </Link>
                          <button
                            type="button"
                            aria-label={'Eliminar ' + doctor.name}
                            className="text-red-700 underline disabled:opacity-50"
                            disabled={deleting}
                            onClick={() => remove(doctor)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <TablePagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(result.total / pageSize))}
              totalItems={result.total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}

export default DoctorsPage;
