import { createContext, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';
import { clearSession } from '../../shared/api/axiosInstance';

const AuthContext = createContext();

const readSession = () => ({
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  dni: localStorage.getItem('dni'),
});

function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const saveSession = ({ token, role, dni }) => {
    clearSession();
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

    if (dni) {
      localStorage.setItem('dni', dni);
    }

    setSession(readSession());
  };

  const singinAdmin = async (email, password) => {
    const data = await loginAdmin(email, password);

    saveSession({ token: data.token, role: data.role });
  };

  const singinPatient = async (email, dni) => {
    const data = await loginPatient(email, dni);

    saveSession({ token: data.token, role: data.role, dni: String(dni) });
  };

  const singout = () => {
    clearSession();
    setSession(readSession());
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(session.token && session.role),
        role: session.role,
        dni: session.dni,
        singinAdmin,
        singinPatient,
        singout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };
