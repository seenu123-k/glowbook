import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface Salon {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  services: string[];
}

interface Service {
  name: string;
  category: string;
  description: string;
  image: string;
}

const salons: Salon[] = [
  {
    id: '1',
    name: 'Glow Beauty Salon',
    location: 'Kumbakonam',
    rating: 5.0,
    reviews: 128,
    category: 'Beauty & Hair',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85',
    services: ['Haircut', 'Hair Styling', 'Facial'],
  },
  {
    id: '2',
    name: 'Style Studio',
    location: 'Trichy',
    rating: 4.8,
    reviews: 96,
    category: 'Hair & Styling',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=85',
    services: ['Haircut', 'Hair Color', 'Bridal Styling'],
  },
  {
    id: '3',
    name: 'Elegant Touch',
    location: 'Madurai',
    rating: 4.9,
    reviews: 84,
    category: 'Beauty & Wellness',
    image:
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=85',
    services: ['Facial', 'Manicure', 'Pedicure'],
  },
  {
    id: '4',
    name: 'Urban Glow',
    location: 'Chennai',
    rating: 4.7,
    reviews: 112,
    category: 'Hair & Beauty',
    image:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=85',
    services: ['Haircut', 'Spa', 'Hair Treatment'],
  },
  {
    id: '5',
    name: 'Blush & Bloom',
    location: 'Coimbatore',
    rating: 4.8,
    reviews: 73,
    category: 'Beauty & Spa',
    image:
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=85',
    services: ['Spa', 'Facial', 'Makeup'],
  },
];

/* =========================================================
   SERVICES
========================================================= */

const services: Service[] = [
  {
    name: 'Haircut',
    category: 'Hair & Styling',
    description: 'Professional haircut and styling.',
    image:
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Hair Styling',
    category: 'Hair & Styling',
    description: 'Modern styling for every occasion.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Facial',
    category: 'Skin Care',
    description: 'Relaxing facial and skin care treatment.',
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Hair Color',
    category: 'Hair & Styling',
    description: 'Premium hair coloring and highlights.',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Bridal Styling',
    category: 'Bridal Beauty',
    description: 'Complete styling for your special day.',
    image:
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=85',
  },
  {
    name: 'Spa',
    category: 'Beauty & Wellness',
    description: 'Relax and refresh with a spa treatment.',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=85',
  },
];

const locations = [
  'All Locations',
  'Kumbakonam',
  'Trichy',
  'Madurai',
  'Chennai',
  'Coimbatore',
];

function CustomerDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All Locations');

  const storedUser = localStorage.getItem('user');

  const user = storedUser ? JSON.parse(storedUser) : null;

  /* =========================================================
     FILTER SALONS
  ========================================================= */

  const filteredSalons = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return salons.filter((salon) => {
      const locationMatch =
        location === 'All Locations' || salon.location === location;

      const searchMatch =
        !searchText ||
        salon.name.toLowerCase().includes(searchText) ||
        salon.location.toLowerCase().includes(searchText) ||
        salon.category.toLowerCase().includes(searchText) ||
        salon.services.some((service) =>
          service.toLowerCase().includes(searchText),
        );

      return locationMatch && searchMatch;
    });
  }, [search, location]);

  /* =========================================================
     BOOK NOW
  ========================================================= */

  const handleBook = (salon: Salon) => {
    navigate('/salon-details', {
      state: {
        salon,
      },
    });
  };

  /* =========================================================
     SERVICE CLICK
  ========================================================= */

  const handleServiceClick = (service: Service) => {
    navigate('/login', {
      state: {
        service,
      },
    });
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    navigate('/', {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO */}

          <button
            onClick={() => navigate('/customer')}
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
          </button>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-8 md:flex">

            <button
              onClick={() => navigate('/customer')}
              className="font-semibold text-slate-950"
            >
              Discover
            </button>

            <button
              onClick={() => navigate('/bookings')}
              className="flex items-center gap-2 font-medium text-slate-500 hover:text-slate-950"
            >
              <CalendarCheck size={17} />
              My Bookings
            </button>

          </nav>

          {/* USER */}

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 sm:flex">

              <User size={17} />

              <span className="max-w-32 truncate text-sm font-semibold">
                {user?.name || 'Customer'}
              </span>

            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:bg-slate-100"
            >
              <LogOut size={17} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ===================================================
            WELCOME
        =================================================== */}

        <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-10 text-white md:px-10 md:py-12">

          <div className="max-w-3xl">

            <p className="text-sm font-semibold tracking-wide text-slate-400">
              WELCOME BACK
            </p>

            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-5xl">
              Hello, {user?.name || 'Customer'} 👋
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Discover great salons near you, choose your
              preferred service and book your next appointment
              with ease.
            </p>

          </div>

          {/* SEARCH */}

          <div className="mt-8 rounded-2xl bg-white p-3">

            <div className="flex flex-col gap-3 md:flex-row">

              {/* LOCATION */}

              <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-slate-900">

                <MapPin
                  size={19}
                  className="shrink-0 text-slate-500"
                />

                <select
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  className="w-full bg-transparent text-sm font-medium outline-none"
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

                <Search
                  size={19}
                  className="shrink-0 text-slate-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search salon, service or location..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                />

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            QUICK STATS
        =================================================== */}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                <CalendarCheck size={20} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Easy Booking
                </p>

                <p className="font-bold">
                  Book in minutes
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Clock3 size={20} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Availability
                </p>

                <p className="font-bold">
                  Flexible time slots
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Star size={20} />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Salons
                </p>

                <p className="font-bold">
                  Trusted experiences
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            SERVICES
        =================================================== */}

        <section className="mt-12">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-semibold tracking-wide text-slate-500">
                EXPLORE SERVICES
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Popular services
              </h2>

              <p className="mt-2 text-slate-500">
                Choose a service and discover salons that offer it.
              </p>

            </div>

            <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm">
              {services.length} services
            </div>

          </div>

          {/* SERVICE CARDS */}

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {services.map((service) => (

              <article
                key={service.name}
                onClick={() => handleServiceClick(service)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* IMAGE */}

                <div className="relative h-52 overflow-hidden">

                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold shadow">
                    {service.category}
                  </div>

                </div>

                {/* DETAILS */}

                <div className="p-6">

                  <h3 className="text-xl font-bold">
                    {service.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleServiceClick(service);
                    }}
                    className="mt-5 w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Explore Service
                  </button>

                </div>

              </article>

            ))}

          </div>

        </section>

        {/* ===================================================
            SALONS
        =================================================== */}

        <section className="mt-12">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-semibold tracking-wide text-slate-500">
                DISCOVER SALONS
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Salons near you
              </h2>

              <p className="mt-2 text-slate-500">
                Choose a salon and explore its services.
              </p>

            </div>

            <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm">
              {filteredSalons.length} salons
            </div>

          </div>

          {/* NO RESULTS */}

          {filteredSalons.length === 0 ? (

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-14 text-center">

              <Search
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-xl font-bold">
                No salons found
              </h3>

              <p className="mt-2 text-slate-500">
                Try a different location or search term.
              </p>

              <button
                onClick={() => {
                  setSearch('');
                  setLocation('All Locations');
                }}
                className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Clear Search
              </button>

            </div>

          ) : (

            /* SALON CARDS */

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filteredSalons
                .slice(0, 5)
                .map((salon) => (

                  <article
                    key={salon.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* IMAGE */}

                    <div className="relative h-56 overflow-hidden">

                      <img
                        src={salon.image}
                        alt={salon.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {/* CATEGORY */}

                      <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold shadow">
                        {salon.category}
                      </div>

                      {/* RATING */}

                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-xl bg-white/95 px-3 py-2 text-sm font-bold shadow">

                        <Star
                          size={14}
                          fill="currentColor"
                        />

                        {salon.rating}

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="p-6">

                      <h3 className="text-xl font-bold">
                        {salon.name}
                      </h3>

                      {/* LOCATION */}

                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">

                        <MapPin size={16} />

                        <span>
                          {salon.location}
                        </span>

                      </div>

                      {/* REVIEWS */}

                      <p className="mt-2 text-sm text-slate-400">
                        {salon.reviews} customer reviews
                      </p>

                      {/* SERVICES */}

                      <div className="mt-4 flex flex-wrap gap-2">

                        {salon.services.map(
                          (service) => (

                            <span
                              key={service}
                              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                            >
                              {service}
                            </span>

                          ),
                        )}

                      </div>

                      {/* BOOK */}

                      <button
                        onClick={() => handleBook(salon)}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >

                        <CalendarCheck size={18} />

                        Book Now

                      </button>

                    </div>

                  </article>

                ))}

            </div>

          )}

        </section>

        {/* ===================================================
            BOOKING INFO
        =================================================== */}

        <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-7 md:p-10">

          <div className="grid gap-8 md:grid-cols-3">

            <div>

              <span className="text-sm font-bold text-slate-400">
                01
              </span>

              <h3 className="mt-2 text-lg font-bold">
                Choose a salon
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search by location and explore the salon that
                matches your needs.
              </p>

            </div>

            <div>

              <span className="text-sm font-bold text-slate-400">
                02
              </span>

              <h3 className="mt-2 text-lg font-bold">
                Select your service
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose the service and stylist you prefer.
              </p>

            </div>

            <div>

              <span className="text-sm font-bold text-slate-400">
                03
              </span>

              <h3 className="mt-2 text-lg font-bold">
                Pick your time
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Select an available date and time and confirm
                your appointment.
              </p>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-12 bg-slate-950 px-6 py-10 text-slate-400">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-950">
                <Sparkles size={18} />
              </div>

              <span className="text-xl font-bold text-white">
                GlowBook
              </span>

            </div>

            <p className="mt-2 text-sm">
              Smart salon booking made simple.
            </p>

          </div>

          <p className="text-sm">
            © 2026 GlowBook. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default CustomerDashboard;