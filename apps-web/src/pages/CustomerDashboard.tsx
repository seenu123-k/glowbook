import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  CalendarCheck,
  Clock3,
  LogOut,
  MapPin,
  Search,
  Sparkles,
  Star,
  User,
} from 'lucide-react';

import api from '../services/api';

interface Staff {
  id: string;
  name: string;
  specialization?: string | null;
  experienceYears?: number;
  status?: string;
}

interface Salon {
  id: string;
  name: string;
  location?: string;
  address?: string;
  rating?: number | string;
  reviewCount?: number;
  reviews?: number;
  category?: string;
  image?: string | null;
  status?: string;
}

function CustomerDashboard() {
  const navigate = useNavigate();

  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalonStaff, setSelectedSalonStaff] =
    useState<Record<string, Staff[]>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] =
    useState('All Locations');

  // =====================================================
  // USER
  // =====================================================

  const storedUser = localStorage.getItem('user');

  let user: any = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  // =====================================================
  // AUTH CHECK
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // =====================================================
  // LOAD SALONS
  // =====================================================

  useEffect(() => {
    const loadSalons = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/salons');

        console.log('SALONS RESPONSE:', response.data);

        const result = response.data?.data ?? response.data;

        const salonList = Array.isArray(result)
          ? result
          : result?.items ?? [];

        const activeSalons = salonList.filter(
          (salon: Salon) =>
            !salon.status || salon.status === 'ACTIVE',
        );

        setSalons(activeSalons);

        // =================================================
        // LOAD STAFF
        // =================================================

        const staffData: Record<string, Staff[]> = {};

        await Promise.all(
          activeSalons.map(async (salon: Salon) => {
            try {
              const salonResponse = await api.get(
                `/salons/${salon.id}`,
              );

              const salonData = salonResponse.data?.data;

              const staff = Array.isArray(salonData?.staff)
                ? salonData.staff.filter(
                    (member: Staff) =>
                      !member.status ||
                      member.status === 'ACTIVE',
                  )
                : [];

              staffData[salon.id] = staff;
            } catch (staffError) {
              console.error(
                `Staff loading failed for ${salon.name}`,
                staffError,
              );

              staffData[salon.id] = [];
            }
          }),
        );

        setSelectedSalonStaff(staffData);
      } catch (err: any) {
        console.error('LOAD SALONS ERROR:', err);

        const message = err?.response?.data?.message;

        if (Array.isArray(message)) {
          setError(message.join(', '));
        } else {
          setError(
            message || 'Unable to load salons.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadSalons();
  }, []);

  // =====================================================
  // LOCATIONS
  // =====================================================

  const locations = useMemo(() => {
    const values = salons
      .map(
        (salon) =>
          salon.location ||
          salon.address ||
          '',
      )
      .filter(Boolean);

    return [
      'All Locations',
      ...Array.from(new Set(values)),
    ];
  }, [salons]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredSalons = useMemo(() => {
    const text = search.trim().toLowerCase();

    return salons.filter((salon) => {
      const salonLocation = (
        salon.location ||
        salon.address ||
        ''
      ).toLowerCase();

      const locationMatch =
        selectedLocation === 'All Locations' ||
        salonLocation.includes(
          selectedLocation.toLowerCase(),
        );

      const searchMatch =
        !text ||
        salon.name
          ?.toLowerCase()
          .includes(text) ||
        salonLocation.includes(text) ||
        salon.category
          ?.toLowerCase()
          .includes(text);

      return locationMatch && searchMatch;
    });
  }, [
    salons,
    search,
    selectedLocation,
  ]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    navigate('/', {
      replace: true,
    });
  };

  // =====================================================
  // BOOK NOW
  // =====================================================

  const handleBookNow = (salon: Salon) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    navigate(`/salon/${salon.id}`, {
      state: {
        salon,
      },
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO */}

          <Link
            to="/customer"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles size={20} />
            </div>

            <span className="text-2xl font-bold">
              Glow
              <span className="text-slate-500">
                Book
              </span>
            </span>
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              to="/customer"
              className="font-semibold text-slate-950"
            >
              Discover
            </Link>

            <Link
              to="/bookings"
              className="flex items-center gap-2 font-medium text-slate-500 hover:text-slate-950"
            >
              <CalendarCheck size={17} />
              My Bookings
            </Link>

          </nav>

          {/* USER */}

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 sm:flex">

              <User size={17} />

              <span className="text-sm font-semibold">
                {user?.name || 'Customer'}
              </span>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
            >
              <LogOut size={17} />

              <span className="hidden sm:block">
                Logout
              </span>
            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="rounded-[2rem] bg-slate-950 px-7 py-10 text-white md:px-10">

          <p className="text-sm font-semibold tracking-wide text-slate-400">
            WELCOME BACK
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-5xl">
            Hello, {user?.name || 'Customer'} 👋
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Discover salons near you, explore their
            services and book your next appointment.
          </p>

          {/* SEARCH */}

          <div className="mt-8 rounded-2xl bg-white p-3">

            <div className="flex flex-col gap-3 md:flex-row">

              {/* LOCATION */}

              <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-slate-900">

                <MapPin size={19} />

                <select
                  id="salon-location"
                  name="salonLocation"
                  value={selectedLocation}
                  onChange={(event) =>
                    setSelectedLocation(
                      event.target.value,
                    )
                  }
                  className="w-full bg-transparent outline-none"
                >
                  {locations.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

              </div>

              {/* SEARCH */}

              <div className="flex flex-[2] items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-slate-900">

                <Search size={19} />

                <input
                  id="salon-search"
                  name="salonSearch"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search salon or location..."
                  className="w-full bg-transparent outline-none"
                />

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            SALONS
        ================================================= */}

        <section className="mt-12">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-sm font-semibold text-slate-500">
                DISCOVER
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Salons near you
              </h2>

              <p className="mt-2 text-slate-500">
                Choose a salon and book your appointment.
              </p>

            </div>

            {!loading && (
              <span className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                {filteredSalons.length} salons
              </span>
            )}

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl bg-white"
                >

                  <div className="h-56 animate-pulse bg-slate-200" />

                  <div className="space-y-4 p-6">

                    <div className="h-6 animate-pulse rounded bg-slate-200" />

                    <div className="h-4 animate-pulse rounded bg-slate-200" />

                    <div className="h-20 animate-pulse rounded bg-slate-200" />

                    <div className="h-12 animate-pulse rounded-xl bg-slate-200" />

                  </div>

                </div>
              ))}

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-10 text-center">

              <h3 className="text-xl font-bold text-red-700">
                Unable to load salons
              </h3>

              <p className="mt-2 text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-5 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
              >
                Try Again
              </button>

            </div>
          )}

          {/* =================================================
              NO RESULTS
          ================================================= */}

          {!loading &&
            !error &&
            filteredSalons.length === 0 && (
              <div className="mt-8 rounded-3xl bg-white p-14 text-center">

                <Search
                  size={40}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-xl font-bold">
                  No salons found
                </h3>

                <p className="mt-2 text-slate-500">
                  Try another location or search term.
                </p>

              </div>
            )}

          {/* =================================================
              SALON CARDS
              SALON IMAGE YES
              STAFF IMAGE NO
          ================================================= */}

          {!loading &&
            !error &&
            filteredSalons.length > 0 && (

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {filteredSalons.map((salon) => {

                  const salonLocation =
                    salon.location ||
                    salon.address ||
                    'Location not available';

                  const rating =
                    Number(salon.rating);

                  const reviewCount =
                    salon.reviewCount ??
                    salon.reviews ??
                    0;

                  const staff =
                    selectedSalonStaff[salon.id] ||
                    [];

                  return (
                    <article
                      key={salon.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >

                      {/* =================================================
                          SALON IMAGE
                          ONLY SALON IMAGE
                      ================================================= */}

                      <div className="h-56 overflow-hidden">

                        {salon.image ? (

                          <img
                            src={salon.image}
                            alt={salon.name}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center bg-slate-200">

                            <Sparkles
                              size={45}
                              className="text-slate-400"
                            />

                          </div>

                        )}

                      </div>

                      {/* =================================================
                          SALON DETAILS
                      ================================================= */}

                      <div className="p-6">

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <h3 className="text-xl font-bold">
                              {salon.name}
                            </h3>

                            {salon.category && (
                              <p className="mt-1 text-sm text-slate-500">
                                {salon.category}
                              </p>
                            )}

                          </div>

                          {rating > 0 &&
                            !Number.isNaN(rating) && (

                              <div className="flex items-center gap-1 text-sm font-bold">

                                <Star
                                  size={15}
                                  fill="currentColor"
                                />

                                {rating.toFixed(1)}

                              </div>

                            )}

                        </div>

                        {/* LOCATION */}

                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                          <MapPin size={16} />

                          {salonLocation}

                        </div>

                        {/* REVIEWS */}

                        {reviewCount > 0 && (
                          <p className="mt-2 text-sm text-slate-400">
                            {reviewCount} reviews
                          </p>
                        )}

                        {/* =================================================
                            STAFF
                            NO PROFILE IMAGE
                        ================================================= */}

                        <div className="mt-6 border-t border-slate-100 pt-5">

                          <div className="flex items-center justify-between">

                            <h4 className="text-sm font-bold">
                              Our Staff
                            </h4>

                            <span className="text-xs text-slate-500">
                              {staff.length} staff
                            </span>

                          </div>

                          {staff.length > 0 ? (

                            <div className="mt-4 space-y-3">

                              {staff.map((member) => (

                                <div
                                  key={member.id}
                                  className="rounded-xl bg-slate-50 px-4 py-3"
                                >

                                  <p className="font-semibold text-slate-900">
                                    {member.name}
                                  </p>

                                  {member.specialization && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {member.specialization}
                                    </p>
                                  )}

                                  {member.experienceYears !== undefined &&
                                    member.experienceYears > 0 && (
                                      <p className="mt-1 text-xs text-slate-400">
                                        {member.experienceYears}{' '}
                                        years experience
                                      </p>
                                    )}

                                </div>

                              ))}

                            </div>

                          ) : (

                            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
                              Staff information not available
                            </div>

                          )}

                        </div>

                        {/* =================================================
                            BOOK NOW
                        ================================================= */}

                        <button
                          type="button"
                          onClick={() =>
                            handleBookNow(salon)
                          }
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                        >

                          <CalendarCheck size={18} />

                          Book Now

                        </button>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

        </section>

        {/* =================================================
            INFO
        ================================================= */}

        <section className="mt-14 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6">

            <CalendarCheck size={24} />

            <h3 className="mt-4 font-bold">
              Easy Booking
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Choose your salon and book in just a few steps.
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6">

            <Clock3 size={24} />

            <h3 className="mt-4 font-bold">
              Available Time
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Select a convenient appointment time.
            </p>

          </div>

          <div className="rounded-2xl bg-white p-6">

            <Star size={24} />

            <h3 className="mt-4 font-bold">
              Trusted Salons
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Explore salons and their services.
            </p>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-12 bg-slate-950 px-6 py-10 text-slate-400">

        <div className="mx-auto max-w-7xl">

          <p className="text-xl font-bold text-white">
            GlowBook
          </p>

          <p className="mt-2 text-sm">
            Smart salon booking made simple.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default CustomerDashboard;