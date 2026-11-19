import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { createSpecialty } from '../services/specialties';

function NewSpecialtyPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();
  const listPath = '/admin/specialties';
  const fieldClass = 'w-full rounded-lg border border-med-border px-3 py-2';

  async function save(values) {
    try {
      await createSpecialty(values);
      navigate(listPath, { replace: true });
    } catch (error) {
      if (error.response?.status === 409) {
        setError(
          'name',
          { message: 'Ya existe una especialidad con ese nombre.' },
          { shouldFocus: true }
        );
      } else {
        setError('root', {
          message: getApiErrorMessage(
            error,
            'No se pudo guardar la especialidad.'
          ),
        });
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Link className="text-sm text-med-primary-700 underline" to={listPath}>
        Especialidades
      </Link>
      <h1 className="text-2xl font-bold text-med-text-main">
        Registrar nueva especialidad
      </h1>
      <Card>
        <form onSubmit={handleSubmit(save)} noValidate>
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              Nombre de la especialidad
              <input
                className={fieldClass}
                aria-invalid={!!errors.name}
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
            </label>
            {errors.name && (
              <p role="alert" className="text-sm text-red-700">
                {errors.name.message}
              </p>
            )}
            <label className="flex flex-col gap-1">
              Descripción
              <textarea
                className={fieldClass}
                rows={4}
                aria-invalid={!!errors.description}
                {...register('description', {
                  setValueAs: (value) => value.trim(),
                  required: 'Ingresá una descripción.',
                  minLength: {
                    value: 10,
                    message:
                      'La descripción debe tener al menos 10 caracteres.',
                  },
                  maxLength: {
                    value: 100,
                    message: 'La descripción admite hasta 100 caracteres.',
                  },
                })}
              />
            </label>
            {errors.description && (
              <p role="alert" className="text-sm text-red-700">
                {errors.description.message}
              </p>
            )}
            {errors.root && (
              <p role="alert" className="text-sm text-red-700">
                {errors.root.message}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => navigate(listPath)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isSubmitting ? 'Guardando…' : 'Guardar especialidad'}
              </Button>
            </div>
          </fieldset>
        </form>
      </Card>
    </div>
  );
}

export default NewSpecialtyPage;
