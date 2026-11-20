import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import Input from '../../shared/components/Input';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { createDoctor } from '../services/doctors';
import { getSpecialties } from '../../specialties/services/specialties';

function NewDoctorPage() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let current = true;

    async function load() {
      setLoadError('');
      setSpecialties(null);
      try {
        const items = [];
        let pageIndex = 0;
        let response;

        do {
          response = await getSpecialties({ pageIndex, pageSize: 100 });

          if (!current) return;

          items.push(...response.data);
          pageIndex++;
        } while (response.data.length > 0 && items.length < response.total);
        setSpecialties(items);
      } catch (error) {
        if (current)
          setLoadError(
            getApiErrorMessage(
              error,
              'No se pudieron cargar las especialidades.'
            )
          );
      }
    }

    load();

    return () => {
      current = false;
    };
  }, [reload]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();
  const listPath = '/admin/doctors';
  const fieldClass =
    'w-full rounded-lg border border-med-border bg-white px-3.5 py-2.5 text-sm font-normal text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 focus:border-transparent';

  async function save(values) {
    try {
      await createDoctor(values);
      navigate(listPath, { replace: true });
    } catch (error) {
      if (error.response?.status === 409) {
        setError(
          'licenseNumber',
          { message: 'Ya existe un médico con esa matrícula.' },
          { shouldFocus: true }
        );
      } else {
        setError('root', {
          message: getApiErrorMessage(error, 'No se pudo guardar el médico.'),
        });
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Link className="text-sm text-med-primary-700 underline" to={listPath}>
        Médicos
      </Link>
      <h1 className="text-2xl font-bold text-med-text-main">
        Registrar nuevo médico
      </h1>
      <Card>
        <form onSubmit={handleSubmit(save)} noValidate>
          <fieldset className="flex flex-col gap-4">
            <Input
              id="doctor-name"
              label="Nombre completo del médico"
              error={errors.name?.message}
              {...register('name', {
                setValueAs: (value) => value.trim(),
                required: 'Ingresá un nombre.',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres.',
                },
                maxLength: {
                  value: 100,
                  message: 'El nombre admite hasta 100 caracteres.',
                },
              })}
            />
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-med-text-main">
              Especialidad
              <select
                aria-label="Especialidad"
                className={fieldClass}
                disabled={!specialties?.length}
                {...register('specialtyId', {
                  required: 'Elegí una especialidad.',
                })}
              >
                <option value="">Seleccionar especialidad</option>
                {specialties?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            {loadError && (
              <div role="alert">
                {loadError}{' '}
                <Button
                  variant="outline"
                  onClick={() => setReload((value) => value + 1)}
                >
                  Reintentar
                </Button>
              </div>
            )}
            {!specialties && !loadError && (
              <p role="status">Cargando especialidades…</p>
            )}
            {specialties?.length === 0 && (
              <p>
                Para registrar un médico, primero{' '}
                <Link className="underline" to="/admin/specialties/new">
                  creá una especialidad
                </Link>
                .
              </p>
            )}
            {errors.specialtyId && (
              <p role="alert" className="text-xs font-medium text-red-700">
                {errors.specialtyId.message}
              </p>
            )}
            <Input
              id="doctor-license"
              label="Matrícula"
              error={errors.licenseNumber?.message}
              {...register('licenseNumber', {
                setValueAs: (value) => value.trim(),
                required: 'Ingresá la matrícula.',
                maxLength: {
                  value: 50,
                  message: 'La matrícula admite hasta 50 caracteres.',
                },
              })}
            />
            {errors.root && (
              <p role="alert" className="text-sm text-red-700">
                {errors.root.message}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => navigate(listPath)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !specialties?.length}
              >
                {isSubmitting ? 'Guardando…' : 'Guardar médico'}
              </Button>
            </div>
          </fieldset>
        </form>
      </Card>
    </div>
  );
}

export default NewDoctorPage;
