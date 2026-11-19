const getApiErrorMessage = (
  error,
  fallback = 'Ocurrió un error inesperado.'
) => {
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Intentá de nuevo.';
  }

  const { status, data } = error.response;

  if (status === 429) {
    return 'Hiciste demasiadas solicitudes. Esperá un momento y volvé a intentar.';
  }

  if (status >= 500) {
    return 'Error del servidor. Intentá de nuevo más tarde.';
  }

  if (data?.message) {
    return data.message;
  }

  if (status === 403) {
    return 'No tenés permiso para realizar esta acción.';
  }

  return fallback;
};

export { getApiErrorMessage };
