import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  Clock3,
  MapPin,
  Scissors,
  UserRound,
  XCircle,
} from 'lucide-react';

import api from '../services/api';

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  price?: string | number;
  notes?: string;

  salon?: {
    id?: string;
    name?: string;
    location?: string;
    address?: string;
    city?: string;
  };

  service?: {
    id?: string;
    name?: string;
    price?: string | number;
    durationMinutes?: number;
  };

  staff?: {
    id?: string;
    name?: string;
  };
}

function MyBookings() {
  const navigate = useNavigate();

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState('');

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get(
        '/appointments/my',
      );

      const data =
        response.data?.data;

      setAppointments(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (err: any) {
      console.error(
        'My bookings error:',
        err,
      );

      const message =
        err?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
              'Unable to load your bookings.',
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const cancelBooking = async (
    appointmentId: string,
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to cancel this booking?',
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(
        appointmentId,
      );

      setError('');

      await api.patch(
        `/appointments/${appointmentId}/cancel`,
        {
          cancellationReason:
            'Cancelled by customer',
        },
      );

      // Reload bookings so status changes to CANCELLED
      await loadBookings();
    } catch (err: any) {
      console.error(
        'Cancel booking error:',
        err,
      );

      const message =
        err?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
              'Unable to cancel booking.',
      );
    } finally {
      setCancellingId(null);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    value: string,
  ) => {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (
    value: string,
  ) => {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status: string,
  ) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700';

      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';

      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';

      case 'CANCELLED':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your bookings...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <button
            onClick={() =>
              navigate('/customer')
            }
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={18} />

            Back to salons
          </button>

          <div className="flex items-center gap-2">

            <CalendarCheck
              size={20}
            />

            <h1 className="text-lg font-bold">
              My Bookings
            </h1>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError('')
              }
              className="font-bold text-red-600"
            >
              ×
            </button>

          </div>
        )}

        {/* PAGE TITLE */}

        <div className="mb-8">

          <p className="text-sm font-semibold tracking-wide text-slate-500">
            YOUR APPOINTMENTS
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            My Bookings
          </h2>

          <p className="mt-2 text-slate-500">
            View and manage your salon appointments.
          </p>

        </div>

        {/* =================================================
            NO BOOKINGS
        ================================================= */}

        {appointments.length ===
        0 ? (

          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

              <CalendarCheck
                size={28}
                className="text-slate-500"
              />

            </div>

            <h3 className="mt-5 text-xl font-bold">
              No bookings yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your salon appointments will appear here.
            </p>

            <button
              onClick={() =>
                navigate('/customer')
              }
              className="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse Salons
            </button>

          </div>

        ) : (

          /* =================================================
             BOOKINGS LIST
          ================================================= */

          <div className="space-y-5">

            {appointments.map(
              (appointment) => (

                <div
                  key={
                    appointment.id
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  {/* =====================================
                      HEADER
                  ====================================== */}

                  <div className="flex flex-col justify-between gap-5 md:flex-row">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100">

                        <Scissors
                          size={24}
                        />

                      </div>

                      <div>

                        <h3 className="text-xl font-bold">

                          {
                            appointment
                              .salon
                              ?.name ||
                            'Salon'
                          }

                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">

                          <MapPin
                            size={14}
                          />

                          {
                            appointment
                              .salon
                              ?.city ||
                            appointment
                              .salon
                              ?.location ||
                            appointment
                              .salon
                              ?.address ||
                            'Salon location'
                          }

                        </p>

                      </div>

                    </div>

                    {/* STATUS */}

                    <span
                      className={`h-fit w-fit rounded-full px-4 py-2 text-xs font-bold ${getStatusClass(
                        appointment.status,
                      )}`}
                    >
                      {
                        appointment.status
                      }
                    </span>

                  </div>

                  {/* =====================================
                      DETAILS
                  ====================================== */}

                  <div className="mt-6 grid gap-4 md:grid-cols-3">

                    {/* DATE */}

                    <div className="rounded-2xl bg-slate-50 p-4">

                      <div className="flex items-center gap-2 text-slate-500">

                        <CalendarCheck
                          size={17}
                        />

                        <span className="text-xs font-semibold uppercase tracking-wide">
                          Date
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-bold">
                        {formatDate(
                          appointment.appointmentDate,
                        )}
                      </p>

                    </div>

                    {/* TIME */}

                    <div className="rounded-2xl bg-slate-50 p-4">

                      <div className="flex items-center gap-2 text-slate-500">

                        <Clock3
                          size={17}
                        />

                        <span className="text-xs font-semibold uppercase tracking-wide">
                          Time
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-bold">

                        {formatTime(
                          appointment.startTime,
                        )}

                        {' - '}

                        {formatTime(
                          appointment.endTime,
                        )}

                      </p>

                    </div>

                    {/* SERVICE */}

                    <div className="rounded-2xl bg-slate-50 p-4">

                      <div className="flex items-center gap-2 text-slate-500">

                        <Scissors
                          size={17}
                        />

                        <span className="text-xs font-semibold uppercase tracking-wide">
                          Service
                        </span>

                      </div>

                      <p className="mt-2 text-sm font-bold">

                        {
                          appointment
                            .service
                            ?.name ||
                          'Service'
                        }

                      </p>

                    </div>

                  </div>

                  {/* =====================================
                      STAFF + AMOUNT
                  ====================================== */}

                  <div className="mt-4 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">

                    <div className="flex items-center gap-2 text-sm text-slate-600">

                      <UserRound
                        size={17}
                      />

                      <span>
                        Stylist:{' '}

                        <strong>
                          {
                            appointment
                              .staff
                              ?.name ||
                            'Staff'
                          }
                        </strong>
                      </span>

                    </div>

                    <div className="text-xl font-bold">

                      ₹
                      {
                        appointment.price ??
                        appointment
                          .service
                          ?.price ??
                        '0'
                      }

                    </div>

                  </div>

                  {/* =====================================
                      CANCEL BUTTON
                  ====================================== */}

                  {(
                    appointment.status ===
                      'PENDING' ||
                    appointment.status ===
                      'CONFIRMED'
                  ) && (

                    <div className="mt-5 border-t border-slate-100 pt-5">

                      <button
                        onClick={() =>
                          cancelBooking(
                            appointment.id,
                          )
                        }
                        disabled={
                          cancellingId ===
                          appointment.id
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >

                        <XCircle
                          size={18}
                        />

                        {cancellingId ===
                        appointment.id
                          ? 'Cancelling...'
                          : 'Cancel Booking'}

                      </button>

                    </div>

                  )}

                  {/* CANCELLED MESSAGE */}

                  {appointment.status ===
                    'CANCELLED' && (

                    <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

                      This booking has been cancelled.

                    </div>

                  )}

                  {/* COMPLETED MESSAGE */}

                  {appointment.status ===
                    'COMPLETED' && (

                    <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">

                      This appointment has been completed.

                    </div>

                  )}

                </div>

              ),
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default MyBookings;