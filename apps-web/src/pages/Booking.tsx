import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Scissors,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import api from '../services/api';

interface Salon {
  id: string;
  name: string;
  location?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  image?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

interface Staff {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  position?: string;
  image?: string;
  isActive?: boolean;
}

interface BookingState {
  salon: Salon;
  services?: Service[];
  staff?: Staff[];
}

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
];

function Booking() {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingState =
    location.state as BookingState | undefined;

  const salon = bookingState?.salon;

  const services =
    bookingState?.services ?? [];

  const staff =
    bookingState?.staff ?? [];

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [selectedStaff, setSelectedStaff] =
    useState<Staff | null>(null);

  const [selectedDate, setSelectedDate] =
    useState('');

  const [selectedTime, setSelectedTime] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [bookingSuccess, setBookingSuccess] =
    useState(false);

  /* =========================================
     NEXT 7 DAYS
  ========================================= */

  const dates = useMemo(() => {
    const result: {
      value: string;
      day: string;
      date: string;
      month: string;
    }[] = [];

    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);

      date.setDate(
        today.getDate() + i,
      );

      const year =
        date.getFullYear();

      const month = String(
        date.getMonth() + 1,
      ).padStart(2, '0');

      const day = String(
        date.getDate(),
      ).padStart(2, '0');

      result.push({
        value: `${year}-${month}-${day}`,

        day: date.toLocaleDateString(
          'en-US',
          {
            weekday: 'short',
          },
        ),

        date: date.toLocaleDateString(
          'en-US',
          {
            day: 'numeric',
          },
        ),

        month: date.toLocaleDateString(
          'en-US',
          {
            month: 'short',
          },
        ),
      });
    }

    return result;
  }, []);

  /* =========================================
     CONVERT AM/PM TO 24 HOUR
  ========================================= */

  const convertTimeTo24Hour = (
    time: string,
  ) => {
    const match = time.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
    );

    if (!match) {
      throw new Error(
        'Invalid time format.',
      );
    }

    let hours =
      Number(match[1]);

    const minutes =
      Number(match[2]);

    const period =
      match[3].toUpperCase();

    if (
      period === 'PM' &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      period === 'AM' &&
      hours === 12
    ) {
      hours = 0;
    }

    return {
      hours,
      minutes,
    };
  };

  /* =========================================
     START TIME
     ISO 8601
  ========================================= */

  const createStartTime = (
    dateString: string,
    timeString: string,
  ) => {
    const {
      hours,
      minutes,
    } =
      convertTimeTo24Hour(
        timeString,
      );

    const [
      year,
      month,
      day,
    ] = dateString
      .split('-')
      .map(Number);

    const date = new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0,
        0,
      ),
    );

    return date.toISOString();
  };

  /* =========================================
     END TIME
     ISO 8601
  ========================================= */

  const createEndTime = (
    dateString: string,
    timeString: string,
    duration: number,
  ) => {
    const {
      hours,
      minutes,
    } =
      convertTimeTo24Hour(
        timeString,
      );

    const [
      year,
      month,
      day,
    ] = dateString
      .split('-')
      .map(Number);

    const date = new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0,
        0,
      ),
    );

    date.setUTCMinutes(
      date.getUTCMinutes() +
        duration,
    );

    return date.toISOString();
  };

  /* =========================================
     APPOINTMENT DATE
  ========================================= */

  const createAppointmentDate = (
    dateString: string,
  ) => {
    const [
      year,
      month,
      day,
    ] = dateString
      .split('-')
      .map(Number);

    const date = new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        0,
        0,
        0,
        0,
      ),
    );

    return date.toISOString();
  };

  /* =========================================
     CONFIRM BOOKING
  ========================================= */

  const handleConfirmBooking =
    async () => {
      setError('');

      const token =
        localStorage.getItem(
          'accessToken',
        );

      if (!token) {
        navigate('/login');
        return;
      }

      if (!salon?.id) {
        setError(
          'Salon information is missing.',
        );
        return;
      }

      if (!selectedService) {
        setError(
          'Please select a service.',
        );
        return;
      }

      if (!selectedStaff) {
        setError(
          'Please select a staff member.',
        );
        return;
      }

      if (!selectedDate) {
        setError(
          'Please select a date.',
        );
        return;
      }

      if (!selectedTime) {
        setError(
          'Please select a time.',
        );
        return;
      }

      try {
        setLoading(true);

        const duration = Number(
          selectedService.duration ??
            selectedService.durationMinutes ??
            30,
        );

        if (
          !Number.isFinite(
            duration,
          ) ||
          duration <= 0
        ) {
          throw new Error(
            'Invalid service duration.',
          );
        }

        const startTime =
          createStartTime(
            selectedDate,
            selectedTime,
          );

        const endTime =
          createEndTime(
            selectedDate,
            selectedTime,
            duration,
          );

        const appointmentDate =
          createAppointmentDate(
            selectedDate,
          );

        const payload = {
          salonId: salon.id,

          serviceId:
            selectedService.id,

          staffId:
            selectedStaff.id,

          appointmentDate,

          startTime,

          endTime,

          ...(notes.trim()
            ? {
                notes:
                  notes.trim(),
              }
            : {}),
        };

        console.log(
          'BOOKING PAYLOAD:',
          payload,
        );

        const response =
          await api.post(
            '/appointments',
            payload,
          );

        console.log(
          'BOOKING SUCCESS:',
          response.data,
        );

        setBookingSuccess(true);
      } catch (err: any) {
        console.error(
          'BOOKING ERROR:',
          err,
        );

        console.error(
          'SERVER RESPONSE:',
          err?.response?.data,
        );

        const message =
          err?.response?.data?.message;

        if (Array.isArray(message)) {
          setError(
            message.join(', '),
          );
        } else if (message) {
          setError(message);
        } else {
          setError(
            err?.message ||
              'Booking failed. Please try again.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* =========================================
     SALON NOT FOUND
  ========================================= */

  if (!salon) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Salon not found
          </h1>

          <p className="mt-2 text-slate-500">
            Please select a salon first.
          </p>

          <button
            onClick={() =>
              navigate('/customer')
            }
            className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white"
          >
            Back to Salons
          </button>

        </div>

      </div>
    );
  }

  /* =========================================
     SUCCESS
  ========================================= */

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-slate-50">

        <header className="border-b bg-white">

          <div className="mx-auto flex max-w-7xl items-center px-6 py-4">

            <div className="flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Sparkles size={20} />
              </div>

              <span className="text-2xl font-bold">
                GlowBook
              </span>

            </div>

          </div>

        </header>

        <main className="flex min-h-[80vh] items-center justify-center px-6">

          <div className="w-full max-w-lg rounded-3xl border bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">

              <CheckCircle2 size={45} />

            </div>

            <h1 className="mt-6 text-3xl font-bold">
              Booking Confirmed!
            </h1>

            <p className="mt-3 text-slate-500">
              Your appointment has been
              successfully booked.
            </p>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Salon
                </span>

                <span className="font-semibold">
                  {salon.name}
                </span>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-slate-500">
                  Service
                </span>

                <span className="font-semibold">
                  {selectedService?.name}
                </span>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-slate-500">
                  Staff
                </span>

                <span className="font-semibold">
                  {selectedStaff?.name}
                </span>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-slate-500">
                  Date
                </span>

                <span className="font-semibold">
                  {selectedDate}
                </span>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-slate-500">
                  Time
                </span>

                <span className="font-semibold">
                  {selectedTime}
                </span>
              </div>

              <div className="mt-4 flex justify-between border-t pt-4">

                <span className="font-bold">
                  Amount
                </span>

                <span className="text-xl font-bold">
                  ₹
                  {selectedService?.price ??
                    0}
                </span>

              </div>

            </div>

            <button
              onClick={() =>
                navigate('/customer')
              }
              className="mt-7 w-full rounded-xl bg-slate-950 py-4 font-semibold text-white hover:bg-slate-800"
            >
              Back to Customer Dashboard
            </button>

          </div>

        </main>

      </div>
    );
  }

  /* =========================================
     MAIN BOOKING PAGE
  ========================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            onClick={() =>
              navigate(
                `/salon/${salon.id}`,
                {
                  state: {
                    salon,
                    services,
                    staff,
                  },
                },
              )
            }
            className="flex items-center gap-2 font-semibold text-slate-600"
          >
            <ArrowLeft size={18} />
            Back to Salon
          </button>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* SALON HEADER */}

        <section className="overflow-hidden rounded-3xl bg-white">

          <div className="relative h-72">

            {salon.image ? (

              <img
                src={salon.image}
                alt={salon.name}
                className="h-full w-full object-cover"
              />

            ) : (

              <div className="flex h-full items-center justify-center bg-slate-200">

                <Scissors size={50} />

              </div>

            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

            <div className="absolute bottom-6 left-6 text-white">

              <p className="text-sm text-slate-300">
                {salon.category ||
                  'Beauty & Salon'}
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                {salon.name}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm">
                <MapPin size={16} />
                {salon.location ||
                  salon.address ||
                  'Location unavailable'}
              </p>

              {salon.rating !==
                undefined && (

                <p className="mt-2 flex items-center gap-1 text-sm">
                  <Star
                    size={15}
                    fill="currentColor"
                  />
                  {salon.rating}
                </p>

              )}

            </div>

          </div>

        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* LEFT */}

          <div className="space-y-8">

            {/* SERVICE */}

            <section className="rounded-3xl border bg-white p-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
                  1
                </div>

                <h2 className="text-xl font-bold">
                  Select Service
                </h2>

              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">

                {services.length === 0 ? (

                  <p className="text-slate-500">
                    No services available.
                  </p>

                ) : (

                  services.map(
                    (service) => {

                      const active =
                        selectedService?.id ===
                        service.id;

                      const duration =
                        service.duration ??
                        service.durationMinutes ??
                        30;

                      return (

                        <button
                          key={service.id}
                          onClick={() => {
                            setSelectedService(
                              service,
                            );
                            setError('');
                          }}
                          className={`rounded-2xl border p-5 text-left ${
                            active
                              ? 'border-slate-950 bg-slate-950 text-white'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >

                          <div className="flex justify-between">

                            <div>

                              <p className="font-bold">
                                {service.name}
                              </p>

                              <p className="mt-2 flex items-center gap-1 text-sm opacity-70">

                                <Clock size={14} />

                                {duration} minutes

                              </p>

                            </div>

                            <span className="font-bold">
                              ₹
                              {service.price}
                            </span>

                          </div>

                        </button>

                      );
                    },
                  )

                )}

              </div>

            </section>

            {/* STAFF */}

            <section className="rounded-3xl border bg-white p-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
                  2
                </div>

                <h2 className="text-xl font-bold">
                  Select Staff
                </h2>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {staff.length === 0 ? (

                  <p className="text-slate-500">
                    No staff available.
                  </p>

                ) : (

                  staff.map(
                    (member) => {

                      const active =
                        selectedStaff?.id ===
                        member.id;

                      return (

                        <button
                          key={member.id}
                          onClick={() => {
                            setSelectedStaff(
                              member,
                            );
                            setError('');
                          }}
                          className={`rounded-2xl border p-4 text-left ${
                            active
                              ? 'border-slate-950 bg-slate-950 text-white'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >

                          <div className="flex items-center gap-4">

                            {member.image ? (

                              <img
                                src={member.image}
                                alt={member.name}
                                className="h-14 w-14 rounded-xl object-cover"
                              />

                            ) : (

                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">

                                <User
                                  size={25}
                                  className="text-slate-400"
                                />

                              </div>

                            )}

                            <div>

                              <p className="font-bold">
                                {member.name}
                              </p>

                              <p className="mt-1 text-sm opacity-70">
                                {member.role ||
                                  member.position ||
                                  'Stylist'}
                              </p>

                            </div>

                          </div>

                        </button>

                      );
                    },
                  )

                )}

              </div>

            </section>

            {/* DATE */}

            <section className="rounded-3xl border bg-white p-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
                  3
                </div>

                <h2 className="text-xl font-bold">
                  Select Date
                </h2>

              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">

                {dates.map(
                  (date) => {

                    const active =
                      selectedDate ===
                      date.value;

                    return (

                      <button
                        key={date.value}
                        onClick={() => {
                          setSelectedDate(
                            date.value,
                          );

                          setSelectedTime(
                            '',
                          );

                          setError('');
                        }}
                        className={`rounded-2xl border p-4 ${
                          active
                            ? 'border-slate-950 bg-slate-950 text-white'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >

                        <p className="text-xs">
                          {date.day}
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                          {date.date}
                        </p>

                        <p className="text-xs">
                          {date.month}
                        </p>

                      </button>

                    );
                  },
                )}

              </div>

            </section>

            {/* TIME */}

            <section className="rounded-3xl border bg-white p-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
                  4
                </div>

                <h2 className="text-xl font-bold">
                  Select Time
                </h2>

              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">

                {TIME_SLOTS.map(
                  (time) => {

                    const active =
                      selectedTime ===
                      time;

                    return (

                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(
                            time,
                          );
                          setError('');
                        }}
                        className={`rounded-xl border px-4 py-3 font-semibold ${
                          active
                            ? 'border-slate-950 bg-slate-950 text-white'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >

                        <Clock
                          size={15}
                          className="mx-auto mb-1"
                        />

                        {time}

                      </button>

                    );
                  },
                )}

              </div>

            </section>

            {/* NOTES */}

            <section className="rounded-3xl border bg-white p-7">

              <h2 className="text-xl font-bold">
                Additional Notes
              </h2>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value,
                  )
                }
                rows={4}
                placeholder="Any special request..."
                className="mt-5 w-full rounded-2xl border p-4 outline-none"
              />

            </section>

          </div>

          {/* SUMMARY */}

          <aside className="h-fit lg:sticky lg:top-24">

            <div className="rounded-3xl border bg-white p-7 shadow-sm">

              <p className="text-sm font-semibold text-slate-500">
                BOOKING SUMMARY
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Your Appointment
              </h2>

              <div className="my-6 border-t" />

              <div className="space-y-4">

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Salon
                  </span>

                  <span className="text-right font-semibold">
                    {salon.name}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Service
                  </span>

                  <span className="text-right font-semibold">
                    {selectedService?.name ||
                      'Not selected'}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Staff
                  </span>

                  <span className="text-right font-semibold">
                    {selectedStaff?.name ||
                      'Not selected'}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Date
                  </span>

                  <span className="font-semibold">
                    {selectedDate ||
                      'Not selected'}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Time
                  </span>

                  <span className="font-semibold">
                    {selectedTime ||
                      'Not selected'}
                  </span>
                </div>

              </div>

              <div className="my-6 border-t" />

              <div className="flex justify-between">

                <span className="font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ₹
                  {selectedService?.price ??
                    0}
                </span>

              </div>

              {error && (

                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>

              )}

              <button
                onClick={
                  handleConfirmBooking
                }
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-4 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >

                <CalendarCheck size={19} />

                {loading
                  ? 'Booking...'
                  : 'Confirm Booking'}

              </button>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default Booking;