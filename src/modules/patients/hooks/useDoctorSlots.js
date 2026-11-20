import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { getDoctorSlots } from '../../doctors/services/doctors';

// Consulta los horarios de un médico entre dos fechas (YYYY-MM-DD).
function useDoctorSlots(doctorId, from, to) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let current = true;

    async function loadSlots() {
      setSlots([]);
      setError('');
      setLoading(true);

      try {
        const result = await getDoctorSlots(doctorId, from, to);

        if (current) setSlots(result);
      } catch (err) {
        if (current) {
          setError(
            getApiErrorMessage(err, 'No se pudieron cargar los horarios.')
          );
        }
      } finally {
        if (current) setLoading(false);
      }
    }

    if (doctorId) {
      loadSlots();
    } else {
      setSlots([]);
      setError('');
      setLoading(false);
    }

    return () => {
      current = false;
    };
  }, [doctorId, from, to, refresh]);

  // Marca un horario como reservado sin modificar el array original.
  function markBooked(slotId) {
    setSlots((currentSlots) =>
      currentSlots.map((slot) =>
        slot.id === slotId ? { ...slot, status: 'BOOKED' } : slot
      )
    );
  }

  // Vuelve a pedir los horarios de la misma semana.
  function reloadSlots() {
    setSlots([]);
    setLoading(true);
    setRefresh((value) => value + 1);
  }

  return { slots, loading, error, markBooked, reloadSlots };
}

export default useDoctorSlots;
