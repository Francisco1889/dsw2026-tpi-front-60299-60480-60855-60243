const ROLES = {
  admin: 'ADMINISTRADOR',
  patient: 'PACIENTE',
};

const getHomePath = (role) => {
  if (role === ROLES.admin) {
    return '/admin/home';
  }

  if (role === ROLES.patient) {
    return '/';
  }

  return null;
};

export { ROLES, getHomePath };
