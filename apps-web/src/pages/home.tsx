import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  CalendarCheck,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

import api from '../services/api';

interface Salon {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  status?: string;
}

interface DatabaseSalon {
  id: string;
  name: string;
  location?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  image?: string;
  status?: string;
}

/*
=========================================================
STATIC SALONS
Glow Beauty Salon is NOT included here.
It comes from database.
=========================================================
*/

const staticSalons: Salon[] = [
  {
    id: 'static-2',
    name: 'Style Studio',
    location: 'Trichy',
    rating: 4.8,
    reviews: 96,
    category: 'Hair & Styling',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80',
  },

  {
    id: 'static-3',
    name: 'Elegant Touch',
    location: 'Madurai',
    rating: 4.9,
    reviews: 84,
    category: 'Beauty & Wellness',
    image:
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80',
  },

  {
    id: 'static-4',
    name: 'Urban Glow',
    location: 'Chennai',
    rating: 4.7,
    reviews: 112,
    category: 'Hair & Beauty',
    image:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=80',
  },

  {
    id: 'static-5',
    name: 'Blush & Bloom',
    location: 'Coimbatore',
    rating: 4.8,
    reviews: 73,
    category: 'Beauty & Spa',
    image:
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=900&q=80',
  },

  /*
  =======================================================
  NEW 6TH STATIC SALON
  =======================================================
  */

  {
    id: 'static-6',
    name: 'Royal Shine Salon',
    location: 'Thanjavur',
    rating: 4.9,
    reviews: 67,
    category: 'Beauty & Hair',
    image:
      'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=900&q=80',
  },
];


const services = [
  {
    name: 'Haircut',
    category: 'Hair & Styling',
    description: 'Professional haircut and styling.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Hair Styling',
    category: 'Hair & Styling',
    description: 'Modern styling for every occasion.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Facial',
    category: 'Skin Care',
    description: 'Relaxing facial and skin care treatment.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Hair Color',
    category: 'Hair & Styling',
    description: 'Premium hair coloring and highlights.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bridal Styling',
    category: 'Bridal Beauty',
    description: 'Complete styling for your special day.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Spa',
    category: 'Beauty & Wellness',
    description: 'Relax and refresh with a spa treatment.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  },
];

function Home() {
  const navigate = useNavigate();

  /*
  =======================================================
  DATABASE SALON
  =======================================================
  */

  const [databaseSalon, setDatabaseSalon] =
    useState<Salon | null>(null);

  const [loadingSalon, setLoadingSalon] =
    useState(true);

  const [salonError, setSalonError] =
    useState('');

  /*
  =======================================================
  SEARCH
  =======================================================
  */

  const [search, setSearch] =
    useState('');

  const [location, setLocation] =
    useState('All Locations');

  /*
  =======================================================
  MODAL
  =======================================================
  */

  const [selectedSalon, setSelectedSalon] =
    useState<Salon | null>(null);

  /*
  =======================================================
  GET GLOW BEAUTY SALON FROM DATABASE
  =======================================================
  */

  useEffect(() => {
    loadGlowBeautySalon();
  }, []);

  const loadGlowBeautySalon = async () => {
    try {
      setLoadingSalon(true);
      setSalonError('');

      const response = await api.get('/salons');

      const data =
        response.data?.data;

      if (!Array.isArray(data)) {
        setDatabaseSalon(null);
        return;
      }

      /*
      ---------------------------------------------------
      Find Glow Beauty Salon
      ---------------------------------------------------
      */

      const glowBeauty =
        data.find(
          (salon: DatabaseSalon) =>
            salon.name
              ?.trim()
              .toLowerCase() ===
            'glow beauty salon',
        );

      if (!glowBeauty) {
        setDatabaseSalon(null);
        return;
      }

      /*
      ---------------------------------------------------
      Convert database salon to Home Salon format
      ---------------------------------------------------
      */

      const formattedSalon: Salon = {
        id: glowBeauty.id,

        name:
          glowBeauty.name ||
          'Glow Beauty Salon',

        location:
          glowBeauty.location ||
          'Kumbakonam',

        rating:
          Number(
            glowBeauty.rating,
          ) || 5.0,

        reviews:
          Number(
            glowBeauty.reviews,
          ) || 0,

        category:
          glowBeauty.category ||
          'Beauty & Hair',

        image:
          glowBeauty.image ||
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80',

        status:
          glowBeauty.status,
      };

      setDatabaseSalon(
        formattedSalon,
      );
    } catch (error: any) {
      console.error(
        'Failed to load Glow Beauty Salon:',
        error,
      );

      setSalonError(
        error?.response?.data?.message ||
          'Unable to load Glow Beauty Salon.',
      );

      setDatabaseSalon(null);
    } finally {
      setLoadingSalon(false);
    }
  };

  /*
  =======================================================
  FINAL 6 SALONS

  1. Glow Beauty Salon - Database
  2. Style Studio
  3. Elegant Touch
  4. Urban Glow
  5. Blush & Bloom
  6. Royal Shine Salon
  =======================================================
  */

  const salons = useMemo(() => {
    const result: Salon[] = [];

    if (databaseSalon) {
      result.push(databaseSalon);
    }

    result.push(...staticSalons);

    return result;
  }, [databaseSalon]);

  /*
  =======================================================
  LOCATIONS
  =======================================================
  */

  const locations = useMemo(() => {
    const uniqueLocations =
      Array.from(
        new Set(
          salons.map(
            (salon) =>
              salon.location,
          ),
        ),
      );

    return [
      'All Locations',
      ...uniqueLocations,
    ];
  }, [salons]);

  /*
  =======================================================
  FILTER
  =======================================================
  */

  const filteredSalons =
    salons.filter((salon) => {
      const matchesLocation =
        location ===
          'All Locations' ||
        salon.location ===
          location;

      const searchText =
        search
          .trim()
          .toLowerCase();

      const matchesSearch =
        !searchText ||
        salon.name
          .toLowerCase()
          .includes(searchText) ||
        salon.location
          .toLowerCase()
          .includes(searchText) ||
        salon.category
          .toLowerCase()
          .includes(searchText);

      return (
        matchesLocation &&
        matchesSearch
      );
    });

  /*
  =======================================================
  VIEW DETAILS
  =======================================================
  */

  const handleViewDetails = (
    salon: Salon,
  ) => {
    setSelectedSalon(null);

    navigate(
      `/salon/${salon.id}`,
      {
        state: {
          salon,
        },
      },
    );
  };

  /*
  =======================================================
  CONTACT FORM
  =======================================================
  */

  const handleContactSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    alert(
      'Thank you! Your message has been received.',
    );

    event.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="flex items-center gap-2"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles size={20} />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              Glow
              <span className="text-slate-500">
                Book
              </span>
            </span>

          </button>

          <nav className="hidden items-center gap-7 md:flex">

            <a
              href="#home"
              className="font-medium text-slate-900 hover:text-slate-600"
            >
              Home
            </a>

            <a
              href="#salons"
              className="font-medium text-slate-500 hover:text-slate-950"
            >
              Salons
            </a>

            <a
              href="#services"
              className="font-medium text-slate-500 hover:text-slate-950"
            >
              Services
            </a>

            <a
              href="#features"
              className="font-medium text-slate-500 hover:text-slate-950"
            >
              Features
            </a>

            <a
              href="#how"
              className="font-medium text-slate-500 hover:text-slate-950"
            >
              How it works
            </a>

            <a
              href="#contact"
              className="font-medium text-slate-500 hover:text-slate-950"
            >
              Contact
            </a>

          </nav>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                navigate('/login')
              }
              className="rounded-xl px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Login
            </button>

            <button
              onClick={() =>
                navigate('/register')
              }
              className="rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Register
            </button>

          </div>

        </div>

      </header>

      {/* ==================================================
          HERO
      ================================================== */}

      <section
        id="home"
        className="overflow-hidden bg-slate-950"
      >

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">

          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300">

              <Sparkles size={16} />

              Smart salon booking platform

            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">

              Beauty starts with

              <span className="block text-slate-400">
                the right appointment.
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">

              Discover trusted salons near you,
              explore their services, choose your
              preferred stylist and book your perfect
              time with GlowBook.

            </p>

            {/* SEARCH */}

            <div className="mt-9 rounded-2xl bg-white p-3 shadow-2xl">

              <div className="flex flex-col gap-3 lg:flex-row">

                <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-100 px-4 py-3">

                  <MapPin
                    size={20}
                    className="shrink-0 text-slate-500"
                  />

                  <select
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value,
                      )
                    }
                    className="w-full bg-transparent text-sm font-medium outline-none"
                  >

                    {locations.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ),
                    )}

                  </select>

                </div>

                <div className="flex flex-[1.5] items-center gap-3 rounded-xl bg-slate-100 px-4 py-3">

                  <Search
                    size={20}
                    className="shrink-0 text-slate-500"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search salon or service"
                    className="w-full bg-transparent outline-none placeholder:text-slate-500"
                  />

                </div>

                <button
                  onClick={() =>
                    document
                      .getElementById(
                        'salons',
                      )
                      ?.scrollIntoView({
                        behavior:
                          'smooth',
                      })
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3 font-semibold text-white hover:bg-slate-800"
                >

                  Search

                  <ArrowRight size={18} />

                </button>

              </div>

            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">

              <div className="flex items-center gap-2">
                <ShieldCheck size={18} />
                Trusted salons
              </div>

              <div className="flex items-center gap-2">
                <CalendarCheck size={18} />
                Easy booking
              </div>

              <div className="flex items-center gap-2">
                <Clock3 size={18} />
                Flexible slots
              </div>

            </div>

          </div>

          {/* HERO IMAGE */}

          <div className="relative hidden lg:block">

            <div className="overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-900 p-3 shadow-2xl">

              <img
                src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1000&q=85"
                alt="Modern salon interior"
                className="h-[540px] w-full rounded-[1.5rem] object-cover"
              />

              <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white p-5 shadow-xl">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-slate-500">
                      Featured experience
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      Book your beauty time
                    </h3>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <CalendarCheck size={20} />
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          SALONS
      ================================================== */}

      <section
        id="salons"
        className="bg-slate-50 px-6 py-20"
      >

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="font-semibold text-slate-500">
                DISCOVER
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Find salons near you
              </h2>

              <p className="mt-3 text-slate-500">
                Explore salons by location and choose the one
                that fits your style.
              </p>

            </div>

            <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm">
              {filteredSalons.length} salons found
            </div>

          </div>

          {/* DATABASE LOADING */}

          {loadingSalon && (
            <div className="mt-9 rounded-3xl bg-white p-8 text-center shadow-sm">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

              <p className="mt-3 text-sm text-slate-500">
                Loading salon...
              </p>

            </div>
          )}

          {/* DATABASE ERROR */}

          {!loadingSalon &&
            salonError && (
              <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-700">
                {salonError}
              </div>
            )}

          {/* SALON CARDS */}

          {!loadingSalon && (
            filteredSalons.length ===
            0 ? (

              <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-sm">

                <Search
                  size={35}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-xl font-bold">
                  No salons found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another location or search term.
                </p>

              </div>

            ) : (

              <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {filteredSalons.map(
                  (salon) => (

                    <article
                      key={
                        salon.id
                      }
                      onClick={() => navigate('/login')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          navigate('/login');
                        }
                      }}
                      className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >

                      {/* IMAGE */}

                      <div className="relative h-56 overflow-hidden">

                        <img
                          src={
                            salon.image
                          }
                          alt={
                            salon.name
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold shadow">
                          {
                            salon.category
                          }
                        </div>

                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-xl bg-white/95 px-3 py-2 text-sm font-bold shadow">

                          <Star
                            size={15}
                            fill="currentColor"
                          />

                          {salon.rating}

                        </div>

                      </div>

                      {/* DETAILS */}

                      <div className="p-6">

                        <h3 className="text-xl font-bold">
                          {
                            salon.name
                          }
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">

                          <MapPin
                            size={16}
                          />

                          <span>
                            {
                              salon.location
                            }
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {
                              salon.reviews
                            }{' '}
                            reviews
                          </span>

                        </div>

                        {/* VIEW DETAILS ONLY */}

                        <div className="mt-6">

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate('/login');
                            }}
                            className="w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            View Details
                          </button>

                        </div>

                      </div>

                    </article>

                  ),
                )}

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          SERVICES
      ================================================== */}
      <section
        id="services"
        className="bg-white px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-semibold text-slate-500">POPULAR SERVICES</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Explore our services
              </h2>
              <p className="mt-3 text-slate-500">
                Choose a service to continue to login and start booking.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold">
              6 services
            </div>
          </div>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {services.map((service) => (
    <article
      key={service.name}
      onClick={() => navigate('/login')}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          navigate('/login');
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >

      {/* SERVICE IMAGE */}
      <div className="relative h-56 overflow-hidden">

        <img
          src={service.image}
          alt={service.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* CATEGORY */}
        <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold shadow">
          {service.category}
        </div>

      </div>

      {/* SERVICE DETAILS */}
      <div className="p-6">

        <h3 className="text-xl font-bold">
          {service.name}
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {service.description}
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            navigate('/login');
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Login to continue
          <ArrowRight size={16} />
        </button>

      </div>

    </article>
  ))}
</div>
        </div>
      </section>

      {/* ==================================================
          FEATURES
      ================================================== */}

      <section
        id="features"
        className="px-6 py-20"
      >

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="font-semibold text-slate-500">
              WHY GLOWBOOK
            </p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Everything you need for better bookings
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
              From discovering a salon to managing your
              appointment, everything stays in one place.
            </p>

          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: Search,
                title: 'Discover',
                text: 'Search salons by location and explore their services.',
              },

              {
                icon: Users,
                title: 'Choose stylist',
                text: 'Select the staff member you prefer for your appointment.',
              },

              {
                icon: Clock3,
                title: 'Find a time',
                text: 'Check availability and choose a convenient time slot.',
              },

              {
                icon: CalendarCheck,
                title: 'Manage bookings',
                text: 'View booking history and cancel appointments easily.',
              },
            ].map(
              (feature) => {

                const Icon =
                  feature.icon;

                return (
                  <div
                    key={
                      feature.title
                    }
                    className="rounded-3xl border border-slate-200 p-7"
                  >

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white">

                      <Icon
                        size={21}
                      />

                    </div>

                    <h3 className="mt-5 text-lg font-bold">
                      {
                        feature.title
                      }
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {
                        feature.text
                      }
                    </p>

                  </div>
                );

              },
            )}

          </div>

        </div>

      </section>

      {/* ==================================================
          HOW IT WORKS
      ================================================== */}

      <section
        id="how"
        className="bg-slate-50 px-6 py-20"
      >

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="font-semibold text-slate-500">
              SIMPLE PROCESS
            </p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Your appointment in three steps
            </h2>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {[
              {
                number: '01',
                title: 'Find a salon',
                text: 'Choose your location and discover salons that match your needs.',
              },

              {
                number: '02',
                title: 'Choose your appointment',
                text: 'Select a service, stylist, date and available time.',
              },

              {
                number: '03',
                title: 'Book & relax',
                text: 'Confirm your appointment and manage it from your account.',
              },
            ].map(
              (step) => (

                <div
                  key={
                    step.number
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-8"
                >

                  <span className="text-4xl font-bold text-slate-300">
                    {
                      step.number
                    }
                  </span>

                  <h3 className="mt-6 text-xl font-bold">
                    {
                      step.title
                    }
                  </h3>

                  <p className="mt-3 leading-7 text-slate-500">
                    {
                      step.text
                    }
                  </p>

                </div>

              ),
            )}

          </div>

        </div>

      </section>

      {/* ==================================================
          CONTACT
      ================================================== */}

      <section
        id="contact"
        className="bg-white px-6 py-20"
      >

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>

              <p className="font-semibold text-slate-500">
                CONTACT US
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                We'd love to hear from you.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">
                Have a question about GlowBook, salon bookings,
                or managing your salon? Get in touch with our team.
              </p>

              <div className="mt-9 space-y-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <MapPin size={20} />
                  </div>

                  <div>

                    <h3 className="font-bold">
                      Location
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Kumbakonam, Tamil Nadu, India
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Mail size={20} />
                  </div>

                  <div>

                    <h3 className="font-bold">
                      Email
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      support@glowbook.com
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Phone size={20} />
                  </div>

                  <div>

                    <h3 className="font-bold">
                      Phone
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      +91 98765 43210
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* CONTACT FORM */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm md:p-9">

              <h3 className="text-2xl font-bold">
                Send us a message
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                We'll get back to you as soon as possible.
              </p>

              <form
                onSubmit={
                  handleContactSubmit
                }
                className="mt-7 space-y-5"
              >

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Name
                  </label>

                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                    required
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Message
                  </label>

                  <textarea
                    rows={5}
                    placeholder="How can we help?"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-950 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                >
                  Send Message
                </button>

              </form>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="px-6 py-20">

        <div className="mx-auto max-w-7xl rounded-[2rem] bg-slate-950 px-7 py-14 text-center text-white md:px-12">

          <Sparkles
            size={30}
            className="mx-auto"
          />

          <h2 className="mt-5 text-3xl font-bold md:text-4xl">
            Ready for your next salon appointment?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            Join GlowBook and make salon booking simple,
            convenient and stress-free.
          </p>

          <button
            onClick={() =>
              navigate('/register')
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-slate-950 hover:bg-slate-200"
          >
            Create Account
            <ArrowRight size={18} />
          </button>

        </div>

      </section>

      {/* ==================================================
          SALON DETAILS MODAL
      ================================================== */}

      {selectedSalon && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-5 backdrop-blur-sm"
          onClick={() =>
            setSelectedSalon(null)
          }
        >

          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <img
              src={
                selectedSalon.image
              }
              alt={
                selectedSalon.name
              }
              className="h-64 w-full object-cover"
            />

            <div className="p-7">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-sm font-semibold text-slate-500">
                    {
                      selectedSalon.category
                    }
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {
                      selectedSalon.name
                    }
                  </h2>

                </div>

                <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">

                  <Star
                    size={15}
                    fill="currentColor"
                  />

                  {
                    selectedSalon.rating
                  }

                </div>

              </div>

              <div className="mt-4 flex items-center gap-2 text-slate-500">

                <MapPin size={17} />

                {
                  selectedSalon.location
                }

              </div>

              <p className="mt-5 leading-7 text-slate-500">
                Explore salon services, choose your preferred
                stylist and find an available appointment time.
              </p>

              <div className="mt-6 flex gap-3">

                <button
                  onClick={() =>
                    setSelectedSalon(
                      null,
                    )
                  }
                  className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold hover:bg-slate-100"
                >
                  Close
                </button>

                <button
                  onClick={() =>
                    handleViewDetails(
                      selectedSalon,
                    )
                  }
                  className="flex-1 rounded-xl bg-slate-950 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  View Salon
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="bg-slate-950 px-6 py-10 text-slate-400">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">

          <div>

            <p className="text-xl font-bold text-white">
              GlowBook
            </p>

            <p className="mt-1 text-sm">
              Smart salon booking made simple.
            </p>

          </div>

          <div className="flex gap-6 text-sm">

            <a
              href="#home"
              className="hover:text-white"
            >
              Home
            </a>

            <a
              href="#salons"
              className="hover:text-white"
            >
              Salons
            </a>

            <a
              href="#contact"
              className="hover:text-white"
            >
              Contact
            </a>

          </div>

          <p className="text-sm">
            © 2026 GlowBook. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;