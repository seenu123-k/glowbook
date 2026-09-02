import { useEffect, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  CalendarCheck,
  Clock3,
  MapPin,
  Scissors,
  Star,
  UserRound,
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
  price?: number;
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

function SalonDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const locationState =
    useLocation();

  const stateSalon =
    locationState.state?.salon as
      | Salon
      | undefined;

  const [salon, setSalon] =
    useState<Salon | null>(
      stateSalon || null,
    );

  const [services, setServices] =
    useState<Service[]>([]);

  const [staff, setStaff] =
    useState<Staff[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // =====================================================
  // LOAD SALON
  // GET /salons/:id
  // =====================================================

  useEffect(() => {
    if (!id) {
      setError(
        'Salon ID is missing.',
      );

      setLoading(false);

      return;
    }

    const loadSalon = async () => {
      try {
        setLoading(true);
        setError('');

        /*
         * Even if salon came through
         * navigation state, we fetch the
         * real database record.
         */

        const response =
          await api.get(
            `/salons/${id}`,
          );

        console.log(
          'SALON RESPONSE:',
          response.data,
        );

        const data =
          response.data?.data ??
          response.data;

        setSalon(data);
      } catch (err: any) {
        console.error(
          'SALON ERROR:',
          err,
        );

        /*
         * If API fails but navigation
         * state contains salon data,
         * we can still show that salon.
         */

        if (stateSalon) {
          setSalon(stateSalon);
        } else {
          const message =
            err?.response?.data?.message;

          setError(
            Array.isArray(message)
              ? message.join(', ')
              : message ||
                  'Unable to load salon.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadSalon();
  }, [id]);

  // =====================================================
  // LOAD SERVICES + STAFF
  // =====================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadSalonData =
      async () => {
        try {
          const [
            servicesResponse,
            staffResponse,
          ] = await Promise.all([
            api.get(
              `/services/salon/${id}`,
            ),

            api.get(
              `/staff/salon/${id}`,
            ),
          ]);

          console.log(
            'SERVICES:',
            servicesResponse.data,
          );

          console.log(
            'STAFF:',
            staffResponse.data,
          );

          const servicesData =
            servicesResponse.data?.data ??
            servicesResponse.data;

          const staffData =
            staffResponse.data?.data ??
            staffResponse.data;

          setServices(
            Array.isArray(
              servicesData,
            )
              ? servicesData
              : servicesData?.items ||
                  [],
          );

          setStaff(
            Array.isArray(staffData)
              ? staffData
              : staffData?.items ||
                  [],
          );
        } catch (err) {
          console.error(
            'SERVICE / STAFF ERROR:',
            err,
          );
        }
      };

    loadSalonData();
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

          <p className="mt-4 font-medium text-slate-500">
            Loading salon...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !salon) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Salon not found
          </h1>

          <p className="mt-2 text-slate-500">
            {error ||
              'Unable to find this salon.'}
          </p>

          <button
            type="button"
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

  const salonLocation =
    salon.location ||
    salon.address ||
    'Location not available';

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            type="button"
            onClick={() =>
              navigate('/customer')
            }
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
          >

            <ArrowLeft size={18} />

            Back to salons

          </button>

          <Link
            to="/bookings"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
          >

            <CalendarCheck size={17} />

            My Bookings

          </Link>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* IMAGE */}

        <div className="overflow-hidden rounded-3xl bg-white">

          {salon.image ? (

            <img
              src={salon.image}
              alt={salon.name}
              className="h-[280px] w-full object-cover md:h-[420px]"
            />

          ) : (

            <div className="flex h-[280px] items-center justify-center bg-slate-200 md:h-[420px]">

              <Scissors
                size={60}
                className="text-slate-400"
              />

            </div>

          )}

        </div>

        {/* CONTENT */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-9">

            {/* TITLE */}

            <p className="text-sm font-semibold text-slate-500">
              {salon.category ||
                'Beauty & Salon'}
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              {salon.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-500">

              <span className="flex items-center gap-2">
                <MapPin size={17} />
                {salonLocation}
              </span>

              {typeof salon.rating ===
                'number' && (

                <span className="flex items-center gap-1 font-bold text-slate-900">

                  <Star
                    size={16}
                    fill="currentColor"
                  />

                  {salon.rating}

                </span>
              )}

              {typeof salon.reviews ===
                'number' && (

                <span>
                  {salon.reviews} reviews
                </span>
              )}

            </div>

            {/* =================================================
                ABOUT
            ================================================= */}

            <div className="mt-10">

              <h2 className="text-xl font-bold">
                About this salon
              </h2>

              <p className="mt-3 leading-7 text-slate-500">
                Welcome to {salon.name}.
                Explore our professional
                beauty and styling services,
                choose your preferred stylist
                and book your appointment
                through GlowBook.
              </p>

            </div>

            {/* =================================================
                SERVICES
            ================================================= */}

            <div className="mt-10">

              <div className="flex items-center gap-2">

                <Scissors size={20} />

                <h2 className="text-xl font-bold">
                  Services
                </h2>

              </div>

              {services.length === 0 ? (

                <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  No services available for
                  this salon.
                </div>

              ) : (

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  {services.map(
                    (service) => (

                      <div
                        key={service.id}
                        className="rounded-2xl border border-slate-200 p-5"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <h3 className="font-bold">
                              {service.name}
                            </h3>

                            {service.durationMinutes ||
                              service.duration ? (

                              <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">

                                <Clock3
                                  size={14}
                                />

                                {service.durationMinutes ||
                                  service.duration}{' '}
                                minutes

                              </p>

                            ) : null}

                          </div>

                          {typeof service.price ===
                            'number' && (

                            <span className="font-bold">
                              ₹
                              {service.price}
                            </span>
                          )}

                        </div>

                      </div>

                    ),
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                STAFF
            ================================================= */}

            <div className="mt-10">

              <div className="flex items-center gap-2">

                <UserRound size={20} />

                <h2 className="text-xl font-bold">
                  Our Staff
                </h2>

              </div>

              {staff.length === 0 ? (

                <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                  No staff available for
                  this salon.
                </div>

              ) : (

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  {staff.map(
                    (member) => {

                      const fullName =
                        member.name ||
                        [
                          member.firstName,
                          member.lastName,
                        ]
                          .filter(Boolean)
                          .join(' ') ||
                        'Staff';

                      return (

                        <div
                          key={member.id}
                          className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4"
                        >

                          {member.image ? (

                            <img
                              src={member.image}
                              alt={fullName}
                              className="h-14 w-14 rounded-xl object-cover"
                            />

                          ) : (

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">

                              <UserRound
                                size={24}
                                className="text-slate-400"
                              />

                            </div>

                          )}

                          <div>

                            <h3 className="font-bold">
                              {fullName}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {member.role ||
                                member.position ||
                                'Stylist'}
                            </p>

                          </div>

                        </div>

                      );
                    },
                  )}

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              BOOKING CARD
          ================================================= */}

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <p className="text-sm font-semibold text-slate-500">
              READY TO BOOK?
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Book your appointment
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Select a service, choose your
              stylist and select an available
              date and time.
            </p>

            <div className="mt-6 space-y-3">

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
                  1
                </span>

                <span className="text-sm font-medium">
                  Select a service
                </span>

              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
                  2
                </span>

                <span className="text-sm font-medium">
                  Choose your stylist
                </span>

              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
                  3
                </span>

                <span className="text-sm font-medium">
                  Select date & time
                </span>

              </div>

            </div>

            {/* =================================================
                BOOK APPOINTMENT
            ================================================= */}

            <Link
              to="/booking"
              state={{
                salon,
                services,
                staff,
              }}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 font-semibold text-white transition hover:bg-slate-800"
            >

              <CalendarCheck size={19} />

              Book Appointment

            </Link>

          </aside>

        </div>

      </main>

      {/* FOOTER */}

      <footer className="mt-10 bg-slate-950 px-6 py-8 text-slate-400">

        <div className="mx-auto max-w-7xl">

          <p className="text-lg font-bold text-white">
            GlowBook
          </p>

          <p className="mt-1 text-sm">
            Smart salon booking made simple.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default SalonDetails;