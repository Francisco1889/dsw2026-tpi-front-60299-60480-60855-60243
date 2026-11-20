import { useState, useEffect } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { getSpecialties } from '../../specialties/services/specialties';
import { getDoctors } from '../../doctors/services/doctors';
import useAuth from '../../auth/hook/useAuth';
import { createAppointment } from '../../appointments/services/appointments';
import useDoctorSlots from '../hooks/useDoctorSlots';

const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

const MONTHS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

function getDays(offset) {
  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();

    date.setDate(date.getDate() + offset + i);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    days.push({
      text: date.getFullYear() + '-' + month + '-' + day,
      name: DAY_NAMES[date.getDay()],
      number: date.getDate(),
      month: MONTHS[date.getMonth()],
      label: date.getDate() + ' ' + MONTHS[date.getMonth()],
    });
  }

  return days;
}

function formatDate(text) {
  return new Date(text + 'T00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PatientHome() {
  const { dni } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [weekStart, setWeekStart] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const days = getDays(weekStart);
  const {
    slots,
    loading,
    error: slotsError,
    markBooked,
    reloadSlots,
  } = useDoctorSlots(doctorId, days[0].text, days[6].text);

  useEffect(() => {
    async function loadSpecialties() {
      try {
        const result = await getSpecialties({ pageIndex: 0, pageSize: 100 });

        setSpecialties(result.data);
      } catch (err) {
        setError(
          getApiErrorMessage(err, 'No se pudieron cargar las especialidades.')
        );
      }
    }

    loadSpecialties();
  }, []);

  useEffect(() => {
    let current = true;

    async function loadDoctors() {
      try {
        const result = await getDoctors({
          specialtyId,
          pageIndex: 0,
          pageSize: 100,
        });

        if (current) setDoctors(result.data);
      } catch (err) {
        if (current) {
          setError(
            getApiErrorMessage(err, 'No se pudieron cargar los médicos.')
          );
        }
      }
    }

    if (specialtyId) loadDoctors();

    return () => {
      current = false;
    };
  }, [specialtyId]);

  const doctor = doctors.find((item) => item.id === doctorId);
  const mobileDay = selectedDay || days[0].text;
  const mobileSlots = slots.filter((slot) => slot.date === mobileDay);
  const summary = selectedSlot
    ? formatDate(selectedSlot.date) + ', ' + selectedSlot.startTime + ' HS'
    : 'Elegí un horario';
  const trimmedReason = reason.trim();
  const canBook =
    doctorId &&
    selectedSlot?.status === 'AVAILABLE' &&
    dni &&
    trimmedReason.length >= 5 &&
    trimmedReason.length <= 300 &&
    !loading &&
    !isBooking;

  async function confirmAppointment(event) {
    event.preventDefault();

    if (!canBook) return;

    setIsBooking(true);
    setBookingError('');
    setConfirmedAppointment(null);

    try {
      const appointment = await createAppointment({
        doctorId,
        availabilitySlotId: selectedSlot.id,
        patient: { dni: Number(dni) },
        reason: trimmedReason,
      });

      setConfirmedAppointment(appointment);
      markBooked(selectedSlot.id);
      setSelectedSlot(null);
      setReason('');
    } catch (err) {
      if (err.response?.status === 409) {
        setBookingError(
          'Ese horario ya no está disponible. Elegí otro horario.'
        );
        setSelectedSlot(null);
        reloadSlots();
      } else {
        setBookingError(
          getApiErrorMessage(err, 'No se pudo confirmar el turno.')
        );
      }
    } finally {
      setIsBooking(false);
    }
  }

  function changeSpecialty(id) {
    setSpecialtyId(id);
    setDoctors([]);
    setDoctorId('');
    setSelectedSlot(null);
  }

  function changeDoctor(id) {
    setDoctorId(id);
    setWeekStart(0);
    setSelectedSlot(null);
    setSelectedDay('');
  }

  function changeWeek(offset) {
    setWeekStart(offset);
    setSelectedSlot(null);
    setSelectedDay('');
  }

  function slotClass(slot) {
    const base =
      'w-full py-2 px-3 text-xs font-semibold rounded-lg border text-center ';

    if (slot.status === 'BOOKED') {
      return (
        base +
        'bg-gray-100 border-med-border text-med-text-muted line-through cursor-not-allowed'
      );
    }

    if (selectedSlot?.id === slot.id) {
      return base + 'bg-emerald-400 text-white border-emerald-400 shadow-sm';
    }

    return (
      base +
      'bg-white border-med-border text-med-primary-900 hover:border-med-primary-600'
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* 1. Card Superior: Selector de Especialidad y Doctor */}
      <Card className="p-6 sm:p-7">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-primary-900">
            Reservar Turno Médico
          </h1>
          <p className="text-xs sm:text-sm text-med-text-sub mt-1">
            Seleccione la especialidad y el profesional para continuar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Especialidad */}
          <div className="md:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Seleccionar Especialidad
            </label>
            <div className="relative">
              <select
                value={specialtyId}
                disabled={isBooking}
                onChange={(e) => changeSpecialty(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 pr-10 cursor-pointer"
              >
                <option value="">Elegí una especialidad</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-med-text-muted">
                ▼
              </span>
            </div>
          </div>

          {/* Doctor */}
          <div className="md:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Seleccionar Doctor
            </label>
            <div className="relative">
              <select
                value={doctorId}
                disabled={!specialtyId || isBooking}
                onChange={(e) => changeDoctor(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 pr-10 cursor-pointer"
              >
                <option value="">Elegí un médico</option>
                {doctors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-med-text-muted">
                ▼
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Card de Información del Doctor Seleccionado (Sin reseñas de doctor) */}
      {doctor && (
        <Card className="p-5 sm:p-6 flex items-center gap-4 border-med-border">
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-med-primary-100 flex items-center justify-center text-3xl border border-med-primary-200">
            🩺
          </div>

          <div className="overflow-hidden">
            <h2 className="text-base sm:text-lg font-bold text-med-primary-900">
              {doctor.name}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-med-text-sub mt-0.5">
              {doctor.specialty?.name}
            </p>
            <p className="text-xs text-med-text-muted mt-0.5">
              Matrícula: {doctor.licenseNumber}
            </p>
          </div>
        </Card>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* 3. Selector Semanal de Disponibilidad */}
      <Card className="p-5 sm:p-6 border-med-border">
        {/* Cabecera del calendario de semana */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-med-border-subtle">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={weekStart === 0 || isBooking}
              onClick={() => changeWeek(weekStart - 7)}
              className="p-1 rounded-md border border-med-border hover:bg-gray-50 text-med-text-sub transition disabled:opacity-40"
            >
              ‹
            </button>
            <span className="font-bold text-sm sm:text-base text-med-primary-900">
              {days[0].label} - {days[6].label}
            </span>
            <button
              type="button"
              disabled={isBooking}
              onClick={() => changeWeek(weekStart + 7)}
              className="p-1 rounded-md border border-med-border hover:bg-gray-50 text-med-text-sub transition"
            >
              ›
            </button>
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-4 text-xs text-med-text-sub">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-med-primary-900" />
              Disponible
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Seleccionado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              Reservado
            </span>
          </div>
        </div>

        {!doctorId && (
          <p className="pt-5 text-sm text-med-text-sub">
            Elegí una especialidad y un médico para ver sus horarios.
          </p>
        )}

        {doctorId && loading && (
          <p className="pt-5 text-sm text-med-text-sub">Cargando horarios…</p>
        )}

        {doctorId && !loading && slotsError && (
          <p role="alert" className="pt-5 text-sm text-red-700">
            {slotsError}
          </p>
        )}

        {doctorId && !loading && !slotsError && (
          <>
            {/* --- A) VISTA DESKTOP: Grid semanal de 7 columnas (visible en sm+) --- */}
            <div className="hidden sm:grid sm:grid-cols-7 gap-3 pt-5">
              {days.map((day) => {
                const daySlots = slots.filter((slot) => slot.date === day.text);

                return (
                  <div
                    key={day.text}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="text-center">
                      <span className="text-[11px] font-bold text-med-text-sub uppercase">
                        {day.name}
                      </span>
                      <p className="text-xl font-bold text-med-primary-900 leading-tight">
                        {day.number}
                      </p>
                    </div>

                    <div className="w-full flex flex-col gap-2">
                      {daySlots.length > 0 ? (
                        daySlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={slot.status !== 'AVAILABLE' || isBooking}
                            onClick={() => setSelectedSlot(slot)}
                            className={slotClass(slot)}
                          >
                            {slot.startTime}
                          </button>
                        ))
                      ) : (
                        <p className="py-6 text-center text-xs text-med-text-muted">
                          No hay turnos disponibles para este día.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- B) VISTA MOBILE: Selector de días horizontal + Horarios en bloques (visible en mobile) --- */}
            <div className="block sm:hidden pt-4 space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {days.map((day) => (
                  <button
                    key={day.text}
                    type="button"
                    disabled={isBooking}
                    onClick={() => setSelectedDay(day.text)}
                    className={
                      mobileDay === day.text
                        ? 'flex-1 min-w-[68px] py-2.5 px-2 rounded-xl text-center border bg-med-primary-900 text-white border-med-primary-900'
                        : 'flex-1 min-w-[68px] py-2.5 px-2 rounded-xl text-center border bg-white border-med-border text-med-text-main'
                    }
                  >
                    <span className="block text-[10px] font-bold uppercase">
                      {day.name}
                    </span>
                    <span className="block text-base font-extrabold my-0.5">
                      {day.number}
                    </span>
                    <span className="block text-[10px] uppercase">
                      {day.month}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <span className="block text-xs font-bold text-med-text-sub mb-2.5">
                  Horarios disponibles (Bloques de 30 min)
                </span>

                {mobileSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {mobileSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={slot.status !== 'AVAILABLE' || isBooking}
                        onClick={() => setSelectedSlot(slot)}
                        className={slotClass(slot)}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 border border-med-border rounded-xl text-center">
                    <p className="text-xs text-med-text-muted">
                      No hay turnos disponibles para este día.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      <form
        onSubmit={confirmAppointment}
        className="bg-med-primary-50 border border-med-primary-200/60 rounded-2xl p-5 sm:p-6 flex flex-col gap-4"
      >
        <div className="border-l-4 border-med-primary-900 pl-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-med-text-sub">
            Resumen de Selección
          </span>
          <p className="text-base sm:text-lg font-bold text-med-primary-900 mt-0.5 flex items-center gap-2">
            <span>📅</span>
            <span>{summary}</span>
          </p>
          {selectedSlot && doctor && (
            <p className="text-sm text-med-text-sub">{doctor.name}</p>
          )}
          <p className="text-xs text-med-text-sub mt-0.5">Duración: 30 min</p>
        </div>

        <label className="flex flex-col gap-1 text-sm font-semibold">
          Motivo de consulta
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            minLength={5}
            maxLength={300}
            rows={3}
            disabled={isBooking}
            className="rounded-lg border border-med-border bg-white p-2 font-normal"
          />
          <span className="text-xs font-normal text-med-text-sub">
            Entre 5 y 300 caracteres.
          </span>
        </label>

        {bookingError && (
          <p role="alert" className="text-sm text-red-700">
            {bookingError}
          </p>
        )}

        <Button
          type="submit"
          disabled={!canBook}
          className="w-full sm:w-auto sm:self-end disabled:opacity-50"
        >
          {isBooking ? 'Confirmando…' : 'Confirmar turno'}
        </Button>
        {confirmedAppointment && (
          <div role="status" className="text-sm text-green-800">
            <p className="font-bold">Turno confirmado.</p>
            <p>
              {confirmedAppointment.doctor} ·{' '}
              {formatDate(confirmedAppointment.availableTime.date)} a las{' '}
              {confirmedAppointment.availableTime.startTime}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

export default PatientHome;
