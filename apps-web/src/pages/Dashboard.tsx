import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
  Star,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

// =====================================================
// TYPES
// =====================================================

interface Service {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: string | number;
  durationMinutes: number;
  status: string;
}

interface Staff {
  id: string;
  userId?: string | null;
  name: string;
  bio?: string;
  specialization?: string;
  profileImage?: string;
  experienceYears: number;
  status: string;
}

interface Salon {
  id: string;
  ownerId: string;
  managerId: string | null;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  rating: string | number;
  reviewCount: number;
  status: string;
  image?: string | null;
  services: Service[];
  staff: Staff[];
  workingHours?: WorkingHour[];
}

interface Appointment {
  id: string;
  customerId: string;
  salonId: string;
  staffId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;

  customer?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
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

interface WorkingHour {
  id: string;
  salonId: string;
  staffId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {
  const navigate = useNavigate();

  // ===================================================
  // SALON
  // ===================================================

  const [salon, setSalon] = useState<Salon | null>(null);

  // ===================================================
  // APPOINTMENTS
  // ===================================================

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [appointmentsLoading, setAppointmentsLoading] =
    useState(true);

  // ===================================================
  // WORKING HOURS
  // ===================================================

  const [workingHours, setWorkingHours] =
    useState<WorkingHour[]>([]);

  const [workingHoursLoading, setWorkingHoursLoading] =
    useState(false);

  // ===================================================
  // GENERAL
  // ===================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  // ===================================================
  // STAFF
  // ===================================================

  const [showStaffModal, setShowStaffModal] =
    useState(false);

  const [editingStaff, setEditingStaff] =
    useState<Staff | null>(null);

  const [staffSaving, setStaffSaving] =
    useState(false);

  const [staffForm, setStaffForm] =
    useState({
      name: '',
      bio: '',
      specialization: '',
      profileImage: '',
      experienceYears: '0',
    });

  // ===================================================
  // SERVICE
  // ===================================================

  const [showServiceModal, setShowServiceModal] =
    useState(false);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [serviceSaving, setServiceSaving] =
    useState(false);

  const [serviceForm, setServiceForm] =
    useState({
      name: '',
      description: '',
      price: '',
      durationMinutes: '45',
    });

  const SERVICE_CATEGORY_ID =
    'd2bdf827-a33c-11f1-b298-22329555eb9c';

  // ===================================================
  // WORKING HOUR FORM
  // ===================================================

  const [workingHourSaving, setWorkingHourSaving] =
    useState(false);

  const [workingHourForm, setWorkingHourForm] =
    useState({
      staffId: '',
      dayOfWeek: '1',
      startTime: '09:00',
      endTime: '19:00',
      isAvailable: true,
    });

  // ===================================================
  // USER
  // ===================================================

  const storedUser =
    localStorage.getItem('user');

  let user: any = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  const role =
    user?.role || '';

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    if (role !== 'SALON_OWNER') {
      setLoading(false);
      setAppointmentsLoading(false);
      return;
    }

    loadDashboard();
  }, [navigate, role]);

  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  const loadDashboard = async () => {
    const loadedSalon =
      await loadSalon();

    if (!loadedSalon) {
      setAppointmentsLoading(false);
      setWorkingHoursLoading(false);
      return;
    }

    await Promise.all([
      loadAppointments(loadedSalon.id),
      loadWorkingHours(loadedSalon.id),
    ]);
  };

  // ===================================================
  // LOAD MY SALON
  // ONE OWNER = ONE SALON
  // ===================================================

  const loadSalon =
    async (): Promise<Salon | null> => {
      try {
        setLoading(true);
        setError('');

        const response =
          await api.get('/salons/owner/me');

        const data =
          response.data?.data;

        if (!data) {
          setSalon(null);
          return null;
        }

        const loadedSalon =
          Array.isArray(data)
            ? data[0] || null
            : data;

        if (!loadedSalon) {
          setSalon(null);
          return null;
        }

        setSalon(loadedSalon);
        return loadedSalon;
      } catch (err: any) {
        console.error(
          'Salon loading error:',
          err,
        );

        setSalon(null);

        setError(
          getErrorMessage(
            err,
            'Unable to load your salon details.',
          ),
        );

        return null;
      } finally {
        setLoading(false);
      }
    };

  // ===================================================
  // LOAD APPOINTMENTS
  // ===================================================

  const loadAppointments =
    async (
      salonId?: string,
    ) => {
      const id = salonId || salon?.id;

      if (!id) {
        setAppointments([]);
        setAppointmentsLoading(false);
        return;
      }

      try {
        setAppointmentsLoading(
          true,
        );

        const response =
          await api.get(
            `/appointments/salon/${id}`,
          );

        const data =
          response.data?.data;

        if (
          Array.isArray(data)
        ) {
          setAppointments(data);
        } else if (
          Array.isArray(
            data?.appointments,
          )
        ) {
          setAppointments(
            data.appointments,
          );
        } else if (data) {
          setAppointments([data]);
        } else {
          setAppointments([]);
        }
      } catch (err: any) {
        console.error(
          'Appointments loading error:',
          err,
        );

        setAppointments([]);

        setError(
          getErrorMessage(
            err,
            'Unable to load appointments.',
          ),
        );
      } finally {
        setAppointmentsLoading(
          false,
        );
      }
    };

  // ===================================================
  // LOAD WORKING HOURS
  // ===================================================

  const loadWorkingHours =
    async (
      salonId?: string,
    ) => {
      const id = salonId || salon?.id;

      if (!id) {
        setWorkingHours([]);
        setWorkingHoursLoading(false);
        return;
      }

      try {
        setWorkingHoursLoading(
          true,
        );

        const response =
          await api.get(
            `/working-hours/salon/${id}`,
          );

        const data =
          response.data?.data;

        setWorkingHours(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err: any) {
        console.error(
          'Working hours loading error:',
          err,
        );

        setWorkingHours([]);

        setError(
          getErrorMessage(
            err,
            'Unable to load working hours.',
          ),
        );
      } finally {
        setWorkingHoursLoading(
          false,
        );
      }
    };

  // ===================================================
  // APPOINTMENT ACTION
  // ===================================================

  const updateAppointment =
    async (
      appointmentId: string,
      action:
        | 'confirm'
        | 'complete'
        | 'cancel',
    ) => {
      try {
        setActionLoading(
          `${appointmentId}-${action}`,
        );

        setError('');

        await api.patch(
          `/appointments/${appointmentId}/${action}`,
        );

        await loadAppointments(
          salon?.id,
        );
      } catch (err: any) {
        console.error(
          `Appointment ${action} error:`,
          err,
        );

        setError(
          getErrorMessage(
            err,
            `Unable to ${action} appointment.`,
          ),
        );
      } finally {
        setActionLoading(null);
      }
    };

  // ===================================================
  // STAFF
  // ===================================================

  const openAddStaff = () => {
    setEditingStaff(null);

    setStaffForm({
      name: '',
      bio: '',
      specialization: '',
      profileImage: '',
      experienceYears: '0',
    });

    setError('');
    setShowStaffModal(true);
  };

  const openEditStaff =
    (staff: Staff) => {
      setEditingStaff(staff);

      setStaffForm({
        name:
          staff.name || '',
        bio:
          staff.bio || '',
        specialization:
          staff.specialization ||
          '',
        profileImage:
          staff.profileImage ||
          '',
        experienceYears:
          String(
            staff.experienceYears ??
              0,
          ),
      });

      setError('');
      setShowStaffModal(true);
    };

  const saveStaff =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !staffForm.name.trim()
      ) {
        setError(
          'Staff name is required.',
        );
        return;
      }

      const experienceYears =
        Number(
          staffForm.experienceYears,
        );

      if (
        !Number.isInteger(
          experienceYears,
        ) ||
        experienceYears < 0
      ) {
        setError(
          'Experience must be a whole number of 0 or greater.',
        );
        return;
      }

      try {
        setStaffSaving(true);
        setError('');

        const body: Record<
          string,
          unknown
        > = {
          name:
            staffForm.name.trim(),

          experienceYears,
        };

        if (
          staffForm.bio.trim()
        ) {
          body.bio =
            staffForm.bio.trim();
        }

        if (
          staffForm.specialization.trim()
        ) {
          body.specialization =
            staffForm.specialization.trim();
        }

        if (
          staffForm.profileImage.trim()
        ) {
          body.profileImage =
            staffForm.profileImage.trim();
        }

        if (editingStaff) {
          await api.patch(
            `/staff/${editingStaff.id}`,
            body,
          );
        } else {
          await api.post(
            '/staff',
            body,
          );
        }

        setShowStaffModal(false);
        setEditingStaff(null);

        await refreshSelectedSalon();
      } catch (err: any) {
        console.error(
          'Staff save error:',
          err,
        );

        setError(
          getErrorMessage(
            err,
            editingStaff
              ? 'Unable to update staff.'
              : 'Unable to add staff.',
          ),
        );
      } finally {
        setStaffSaving(false);
      }
    };

  const deactivateStaff =
    async (
      staffId: string,
    ) => {
      if (
        !window.confirm(
          'Are you sure you want to deactivate this staff member?',
        )
      ) {
        return;
      }

      try {
        setActionLoading(
          `staff-${staffId}`,
        );

        setError('');

        await api.patch(
          `/staff/${staffId}/deactivate`,
        );

        await refreshSelectedSalon();
      } catch (err: any) {
        console.error(
          'Staff deactivate error:',
          err,
        );

        setError(
          getErrorMessage(
            err,
            'Unable to deactivate staff.',
          ),
        );
      } finally {
        setActionLoading(null);
      }
    };

  // ===================================================
  // SERVICE
  // ===================================================

  const openAddService =
    () => {
      setEditingService(null);

      setServiceForm({
        name: '',
        description: '',
        price: '',
        durationMinutes: '45',
      });

      setError('');
      setShowServiceModal(true);
    };

  const openEditService =
    (service: Service) => {
      setEditingService(service);

      setServiceForm({
        name:
          service.name || '',
        description:
          service.description ||
          '',
        price:
          String(
            service.price ?? '',
          ),
        durationMinutes:
          String(
            service.durationMinutes ??
              45,
          ),
      });

      setError('');
      setShowServiceModal(true);
    };

  const saveService =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !serviceForm.name.trim()
      ) {
        setError(
          'Service name is required.',
        );
        return;
      }

      const price =
        Number(
          serviceForm.price,
        );

      const durationMinutes =
        Number(
          serviceForm.durationMinutes,
        );

      if (
        Number.isNaN(price) ||
        price < 0
      ) {
        setError(
          'Price must be 0 or greater.',
        );
        return;
      }

      if (
        !Number.isInteger(
          durationMinutes,
        ) ||
        durationMinutes <= 0
      ) {
        setError(
          'Duration must be a whole number greater than 0.',
        );
        return;
      }

      try {
        setServiceSaving(true);
        setError('');

        const body = {
          categoryId:
            editingService?.categoryId ||
            SERVICE_CATEGORY_ID,

          name:
            serviceForm.name.trim(),

          description:
            serviceForm.description.trim(),

          price,

          durationMinutes,
        };

        if (editingService) {
          await api.patch(
            `/services/${editingService.id}`,
            body,
          );
        } else {
          await api.post(
            '/services',
            body,
          );
        }

        setShowServiceModal(false);
        setEditingService(null);

        await refreshSelectedSalon();
      } catch (err: any) {
        console.error(
          'Service save error:',
          err,
        );

        setError(
          getErrorMessage(
            err,
            editingService
              ? 'Unable to update service.'
              : 'Unable to add service.',
          ),
        );
      } finally {
        setServiceSaving(false);
      }
    };

  const deactivateService =
    async (
      serviceId: string,
    ) => {
      if (
        !window.confirm(
          'Are you sure you want to deactivate this service?',
        )
      ) {
        return;
      }

      try {
        setActionLoading(
          `service-${serviceId}`,
        );

        setError('');

        await api.patch(
          `/services/${serviceId}/deactivate`,
        );

        await refreshSelectedSalon();
      } catch (err: any) {
        console.error(
          'Service deactivate error:',
          err,
        );

        setError(
          getErrorMessage(
            err,
            'Unable to deactivate service.',
          ),
        );
      } finally {
        setActionLoading(null);
      }
    };

  // ===================================================
  // WORKING HOURS
  // ===================================================

  const saveWorkingHour =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !workingHourForm.staffId
      ) {
        setError(
          'Please select a staff member.',
        );
        return;
      }

      if (
        workingHourForm.startTime >=
        workingHourForm.endTime
      ) {
        setError(
          'End time must be after start time.',
        );
        return;
      }

      try {
        setWorkingHourSaving(true);
        setError('');

        await api.post(
          '/working-hours',
          {
            staffId:
              workingHourForm.staffId,

            dayOfWeek:
              Number(
                workingHourForm.dayOfWeek,
              ),

            startTime:
              workingHourForm.startTime,

            endTime:
              workingHourForm.endTime,

            isAvailable:
              workingHourForm.isAvailable,
          },
        );

        await loadWorkingHours(
          salon?.id,
        );

        setWorkingHourForm({
          staffId:
            workingHourForm.staffId,
          dayOfWeek:
            workingHourForm.dayOfWeek,
          startTime: '09:00',
          endTime: '19:00',
          isAvailable: true,
        });
      } catch (err: any) {
        console.error(
          'Working hour save error:',
          err,
        );

        setError(
          getErrorMessage(
            err,
            'Unable to save working hours.',
          ),
        );
      } finally {
        setWorkingHourSaving(false);
      }
    };

  const deleteWorkingHour =
    async (
      id: string,
    ) => {
      if (
        !window.confirm(
          'Delete this working hour?',
        )
      ) {
        return;
      }

      try {
        setActionLoading(
          `working-hour-${id}`,
        );

        setError('');

        await api.delete(
          `/working-hours/${id}`,
        );

        await loadWorkingHours(
          salon?.id,
        );
      } catch (err: any) {
        console.error(
          'Working hour delete error:',
          err,
        );

        setError(
          getErrorMessage(
            err,
            'Unable to delete working hour.',
          ),
        );
      } finally {
        setActionLoading(null);
      }
    };

  // ===================================================
  // REFRESH SALON
  // ===================================================

  const refreshSelectedSalon =
    async () => {
      const loaded =
        await loadSalon();

      if (!loaded) {
        return;
      }

      setSalon(loaded);

      await Promise.all([
        loadAppointments(loaded.id),
        loadWorkingHours(loaded.id),
      ]);
    };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout =
    () => {
      localStorage.removeItem(
        'accessToken',
      );

      localStorage.removeItem(
        'user',
      );

      localStorage.removeItem(
        'salon?.id',
      );

      navigate('/login');
    };

  // ===================================================
  // ROLE CHECK
  // ===================================================

  if (
    role !==
    'SALON_OWNER'
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Sparkles size={20} />
              </div>

              <h1 className="text-xl font-bold">
                GlowBook
              </h1>
            </div>

            <button
              onClick={
                handleLogout
              }
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <ShieldIcon />

            <h2 className="mt-5 text-2xl font-bold">
              Salon Owner Dashboard
            </h2>

            <p className="mt-2 text-slate-500">
              Please login with a Salon Owner account.
            </p>

            <button
              onClick={() =>
                navigate('/login')
              }
              className="mt-6 rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white"
            >
              Go to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ===================================================
  // MAIN
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Sparkles size={21} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                GlowBook
              </h1>

              <p className="text-xs font-semibold text-slate-500">
                SALON OWNER
              </p>
            </div>
          </div>

          <button
            onClick={
              handleLogout
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError('')
              }
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <LoadingCard />
        ) : !salon ? (

          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">

            <Sparkles
              size={42}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-5 text-xl font-bold">
              No Salon Assigned
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please contact the administrator to assign a salon.
            </p>

          </div>

        ) : salon ? (

          <>

            {/* =================================================
                WELCOME
            ================================================= */}

            <section className="overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-xl">

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

                <div>

                  <p className="text-sm font-medium text-slate-400">
                    Welcome back,{' '}
                    {user?.name ||
                      'Salon Owner'}
                  </p>

                  <h2 className="mt-2 text-4xl font-bold">
                    {salon.name}
                  </h2>

                  <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                    {salon.description ||
                      'Manage your salon, staff, services and appointments.'}
                  </p>

                </div>

                <div className="flex w-fit items-center gap-2 rounded-2xl bg-white/10 px-5 py-3">

                  <Star
                    size={20}
                    fill="currentColor"
                  />

                  <span className="text-xl font-bold">
                    {salon.rating || '0'}
                  </span>

                  <span className="text-sm text-slate-400">
                    ({salon.reviewCount || 0}{' '}
                    reviews)
                  </span>

                </div>

              </div>

            </section>

            {/* =================================================
                STATS
            ================================================= */}

            <section className="mt-8 grid gap-5 md:grid-cols-4">

              <StatCard
                icon={
                  <CalendarCheck
                    size={22}
                  />
                }
                title="Appointments"
                value={
                  appointmentsLoading
                    ? '...'
                    : String(
                        appointments.length,
                      )
                }
                description="Customer bookings"
              />

              <StatCard
                icon={
                  <Users size={22} />
                }
                title="Staff"
                value={String(
                  salon.staff?.length ||
                    0,
                )}
                description="Salon team"
              />

              <StatCard
                icon={
                  <Scissors
                    size={22}
                  />
                }
                title="Services"
                value={String(
                  salon.services?.length ||
                    0,
                )}
                description="Active services"
              />

              <StatCard
                icon={
                  <Star
                    size={22}
                    fill="currentColor"
                  />
                }
                title="Rating"
                value={String(
                  salon.rating || '0',
                )}
                description={`${salon.reviewCount || 0} reviews`}
              />

            </section>

            {/* =================================================
                SALON INFORMATION
            ================================================= */}

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <MapPin size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Salon Information
                  </h3>

                  <p className="text-sm text-slate-500">
                    Your salon profile
                  </p>
                </div>

              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">

                <InfoItem
                  icon={
                    <MapPin size={18} />
                  }
                  label="Address"
                  value={`${salon.address || ''}, ${salon.city || ''}, ${salon.state || ''} - ${salon.postalCode || ''}`}
                />

                <InfoItem
                  icon={
                    <Phone size={18} />
                  }
                  label="Phone"
                  value={
                    salon.phone ||
                    'Not provided'
                  }
                />

                <InfoItem
                  icon={
                    <Mail size={18} />
                  }
                  label="Email"
                  value={
                    salon.email ||
                    'Not provided'
                  }
                />

                <InfoItem
                  icon={
                    <Sparkles size={18} />
                  }
                  label="Status"
                  value={
                    salon.status
                  }
                />

              </div>

            </section>

            {/* =================================================
                APPOINTMENTS
            ================================================= */}

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <h3 className="text-2xl font-bold">
                    Appointments
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage customer bookings
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5">

                  <CalendarCheck
                    size={18}
                  />

                  <span className="font-bold">
                    {appointments.length}
                  </span>

                  <span className="text-sm text-slate-500">
                    bookings
                  </span>

                </div>

              </div>

              {appointmentsLoading ? (

                <div className="py-12 text-center text-slate-500">
                  Loading appointments...
                </div>

              ) : appointments.length === 0 ? (

                <EmptyAppointments />

              ) : (

                <div className="mt-6 space-y-4">

                  {appointments.map(
                    (appointment) => (
                      <AppointmentCard
                        key={
                          appointment.id
                        }
                        appointment={
                          appointment
                        }
                        actionLoading={
                          actionLoading
                        }
                        onAction={
                          updateAppointment
                        }
                      />
                    ),
                  )}

                </div>
              )}

            </section>

            {/* =================================================
                STAFF
            ================================================= */}

            <section className="mt-8">

              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <div>
                  <h3 className="text-2xl font-bold">
                    Your Staff
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your salon team
                  </p>
                </div>

                <button
                  onClick={
                    openAddStaff
                  }
                  className="w-fit rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  + Add Staff
                </button>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {!salon.staff ||
                salon.staff.length ===
                  0 ? (

                  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 md:col-span-2">
                    No staff members found.
                  </div>

                ) : (

                  salon.staff.map(
                    (staff) => (
                      <div
                        key={
                          staff.id
                        }
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                      >

                        <div className="flex gap-4">

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                            <UserRound
                              size={24}
                            />
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div>
                                <h4 className="text-lg font-bold">
                                  {staff.name}
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                  {staff.specialization ||
                                    'Staff Member'}
                                </p>
                              </div>

                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                                {staff.status}
                              </span>

                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-500">
                              {staff.bio ||
                                'No bio available.'}
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-sm font-semibold">

                              <Clock3
                                size={16}
                              />

                              {
                                staff.experienceYears ??
                                  0
                              }{' '}
                              years experience

                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">

                              <button
                                onClick={() =>
                                  openEditStaff(
                                    staff,
                                  )
                                }
                                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                              >
                                Edit
                              </button>

                              {staff.status ===
                                'ACTIVE' && (
                                <button
                                  onClick={() =>
                                    deactivateStaff(
                                      staff.id,
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    `staff-${staff.id}`
                                  }
                                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                                >
                                  {actionLoading ===
                                  `staff-${staff.id}`
                                    ? 'Deactivating...'
                                    : 'Deactivate'}
                                </button>
                              )}

                            </div>

                          </div>

                        </div>

                      </div>
                    ),
                  )
                )}

              </div>

            </section>

            {/* =================================================
                WORKING HOURS
            ================================================= */}

            <section className="mt-8">

              <div className="mb-5">

                <h3 className="text-2xl font-bold">
                  Working Hours
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Set staff availability
                </p>

              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

                <form
                  onSubmit={
                    saveWorkingHour
                  }
                  className="grid gap-4 md:grid-cols-5"
                >

                  <select
                    value={
                      workingHourForm.staffId
                    }
                    onChange={(e) =>
                      setWorkingHourForm({
                        ...workingHourForm,
                        staffId:
                          e.target.value,
                      })
                    }
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none"
                  >
                    <option value="">
                      Select Staff
                    </option>

                    {(
                      salon.staff ||
                      []
                    )
                      .filter(
                        (staff) =>
                          staff.status ===
                          'ACTIVE',
                      )
                      .map(
                        (staff) => (
                          <option
                            key={
                              staff.id
                            }
                            value={
                              staff.id
                            }
                          >
                            {
                              staff.name
                            }
                          </option>
                        ),
                      )}
                  </select>

                  <select
                    value={
                      workingHourForm.dayOfWeek
                    }
                    onChange={(e) =>
                      setWorkingHourForm({
                        ...workingHourForm,
                        dayOfWeek:
                          e.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none"
                  >
                    <option value="0">
                      Sunday
                    </option>
                    <option value="1">
                      Monday
                    </option>
                    <option value="2">
                      Tuesday
                    </option>
                    <option value="3">
                      Wednesday
                    </option>
                    <option value="4">
                      Thursday
                    </option>
                    <option value="5">
                      Friday
                    </option>
                    <option value="6">
                      Saturday
                    </option>
                  </select>

                  <input
                    type="time"
                    value={
                      workingHourForm.startTime
                    }
                    onChange={(e) =>
                      setWorkingHourForm({
                        ...workingHourForm,
                        startTime:
                          e.target.value,
                      })
                    }
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  />

                  <input
                    type="time"
                    value={
                      workingHourForm.endTime
                    }
                    onChange={(e) =>
                      setWorkingHourForm({
                        ...workingHourForm,
                        endTime:
                          e.target.value,
                      })
                    }
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  />

                  <button
                    type="submit"
                    disabled={
                      workingHourSaving
                    }
                    className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {workingHourSaving
                      ? 'Saving...'
                      : 'Add Working Hour'}
                  </button>

                </form>

              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {workingHoursLoading ? (

                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 md:col-span-2">
                    Loading working hours...
                  </div>

                ) : workingHours.length ===
                  0 ? (

                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 md:col-span-2">
                    No working hours configured yet.
                  </div>

                ) : (

                  workingHours.map(
                    (hour) => (
                      <div
                        key={
                          hour.id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >

                        <div className="flex items-center justify-between">

                          <div>

                            <h4 className="font-bold">
                              {getDayName(
                                hour.dayOfWeek,
                              )}
                            </h4>

                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">

                              <Clock3
                                size={15}
                              />

                              {getStaffName(
                                hour.staffId,
                                salon.staff ||
                                  [],
                              )}

                            </p>

                          </div>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                            {hour.isAvailable
                              ? 'AVAILABLE'
                              : 'OFF'}
                          </span>

                        </div>

                        <div className="mt-4 flex items-center justify-between">

                          <span className="font-semibold">
                            {hour.startTime}
                            {' - '}
                            {hour.endTime}
                          </span>

                          <button
                            onClick={() =>
                              deleteWorkingHour(
                                hour.id,
                              )
                            }
                            disabled={
                              actionLoading ===
                              `working-hour-${hour.id}`
                            }
                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                          >
                            {actionLoading ===
                            `working-hour-${hour.id}`
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>

                        </div>

                      </div>
                    ),
                  )
                )}

              </div>

            </section>

            {/* =================================================
                SERVICES
            ================================================= */}

            <section className="mt-8 pb-12">

              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <div>

                  <h3 className="text-2xl font-bold">
                    Services
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Services offered by your salon
                  </p>

                </div>

                <button
                  onClick={
                    openAddService
                  }
                  className="w-fit rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  + Add Service
                </button>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {!salon.services ||
                salon.services.length ===
                  0 ? (

                  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 md:col-span-2">
                    No services found.
                  </div>

                ) : (

                  salon.services.map(
                    (service) => (
                      <div
                        key={
                          service.id
                        }
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                              <Scissors
                                size={21}
                              />
                            </div>

                            <div>

                              <h4 className="text-lg font-bold">
                                {
                                  service.name
                                }
                              </h4>

                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {service.description ||
                                  'No description'}
                              </p>

                            </div>

                          </div>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                            {
                              service.status
                            }
                          </span>

                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">

                          <span className="text-2xl font-bold">
                            ₹
                            {
                              service.price
                            }
                          </span>

                          <span className="text-sm text-slate-500">
                            {
                              service.durationMinutes
                            }{' '}
                            mins
                          </span>

                        </div>

                        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">

                          <button
                            onClick={() =>
                              openEditService(
                                service,
                              )
                            }
                            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Edit
                          </button>

                          {service.status ===
                            'ACTIVE' && (
                            <button
                              onClick={() =>
                                deactivateService(
                                  service.id,
                                )
                              }
                              disabled={
                                actionLoading ===
                                `service-${service.id}`
                              }
                              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                            >
                              {actionLoading ===
                              `service-${service.id}`
                                ? 'Deactivating...'
                                : 'Deactivate'}
                            </button>
                          )}

                        </div>

                      </div>
                    ),
                  )
                )}

              </div>

            </section>

          </>

        ) : null}

      </main>

      {/* =================================================
          STAFF MODAL
      ================================================= */}

      {showStaffModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">

            <div className="flex items-start justify-between gap-4">

              <div>
                <h3 className="text-2xl font-bold">
                  {editingStaff
                    ? 'Edit Staff'
                    : 'Add Staff'}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingStaff
                    ? 'Update staff details'
                    : `Add staff to ${salon?.name || 'your salon'}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowStaffModal(
                    false,
                  )
                }
                disabled={
                  staffSaving
                }
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <XCircle size={21} />
              </button>

            </div>

            <form
              onSubmit={
                saveStaff
              }
              className="mt-6 space-y-4"
            >

              <input
                value={
                  staffForm.name
                }
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    name:
                      e.target.value,
                  })
                }
                placeholder="Staff Name *"
                maxLength={150}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />

              <input
                value={
                  staffForm.specialization
                }
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    specialization:
                      e.target.value,
                  })
                }
                placeholder="Specialization"
                maxLength={150}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />

              <input
                type="number"
                min="0"
                step="1"
                value={
                  staffForm.experienceYears
                }
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    experienceYears:
                      e.target.value,
                  })
                }
                placeholder="Experience Years"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />

              <textarea
                value={
                  staffForm.bio
                }
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    bio:
                      e.target.value,
                  })
                }
                placeholder="Bio"
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />

              <input
                type="url"
                value={
                  staffForm.profileImage
                }
                onChange={(e) =>
                  setStaffForm({
                    ...staffForm,
                    profileImage:
                      e.target.value,
                  })
                }
                placeholder="Profile Image URL"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              />

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowStaffModal(
                      false,
                    )
                  }
                  disabled={
                    staffSaving
                  }
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    staffSaving
                  }
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {staffSaving
                    ? 'Saving...'
                    : editingStaff
                      ? 'Save Changes'
                      : 'Add Staff'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          SERVICE MODAL
      ================================================= */}

      {showServiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">

            <div className="flex items-start justify-between gap-4">

              <div>
                <h3 className="text-2xl font-bold">
                  {editingService
                    ? 'Edit Service'
                    : 'Add Service'}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingService
                    ? 'Update service details'
                    : `Add service to ${salon?.name || 'your salon'}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowServiceModal(
                    false,
                  )
                }
                disabled={
                  serviceSaving
                }
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <XCircle size={21} />
              </button>

            </div>

            <form
              onSubmit={
                saveService
              }
              className="mt-6 space-y-4"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Service Name *
                </label>

                <input
                  value={
                    serviceForm.name
                  }
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      name:
                        e.target.value,
                    })
                  }
                  placeholder="Hair Cut"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  value={
                    serviceForm.description
                  }
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Professional hair cutting service"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm"
                />

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Price (₹) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      serviceForm.price
                    }
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        price:
                          e.target.value,
                      })
                    }
                    placeholder="350"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    Duration (Minutes) *
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      serviceForm.durationMinutes
                    }
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        durationMinutes:
                          e.target.value,
                      })
                    }
                    placeholder="45"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  />

                </div>

              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Category: Hair & Beauty
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowServiceModal(
                      false,
                    )
                  }
                  disabled={
                    serviceSaving
                  }
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    serviceSaving
                  }
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {serviceSaving
                    ? 'Saving...'
                    : editingService
                      ? 'Save Changes'
                      : 'Add Service'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

// =====================================================
// APPOINTMENT CARD
// =====================================================

function AppointmentCard({
  appointment,
  actionLoading,
  onAction,
}: {
  appointment: Appointment;
  actionLoading: string | null;
  onAction: (
    appointmentId: string,
    action:
      | 'confirm'
      | 'complete'
      | 'cancel',
  ) => void;
}) {
  const confirmLoading =
    actionLoading ===
    `${appointment.id}-confirm`;

  const completeLoading =
    actionLoading ===
    `${appointment.id}-complete`;

  const cancelLoading =
    actionLoading ===
    `${appointment.id}-cancel`;

  return (
    <div className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-md">

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <CalendarCheck
              size={21}
            />
          </div>

          <div>

            <h4 className="font-bold">
              {appointment.customer?.name ||
                'Customer Appointment'}
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              {formatDate(
                appointment.appointmentDate,
              )}
            </p>

            {appointment.customer?.email && (
              <p className="text-xs text-slate-400">
                {
                  appointment.customer.email
                }
              </p>
            )}

          </div>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          <span className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold">
            <Clock3 size={16} />

            {formatTime(
              appointment.startTime,
            )}

            {' - '}

            {formatTime(
              appointment.endTime,
            )}
          </span>

          {appointment.service?.name && (
            <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold">
              {
                appointment.service.name
              }
            </span>
          )}

          {appointment.staff?.name && (
            <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold">
              {
                appointment.staff.name
              }
            </span>
          )}

          <StatusBadge
            status={
              appointment.status
            }
          />

        </div>

      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">

        {appointment.status ===
          'PENDING' && (
          <button
            disabled={
              confirmLoading ||
              cancelLoading
            }
            onClick={() =>
              onAction(
                appointment.id,
                'confirm',
              )
            }
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <CheckCircle2
              size={17}
            />

            {confirmLoading
              ? 'Confirming...'
              : 'Confirm'}
          </button>
        )}

        {appointment.status ===
          'CONFIRMED' && (
          <button
            disabled={
              completeLoading
            }
            onClick={() =>
              onAction(
                appointment.id,
                'complete',
              )
            }
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <CheckCircle2
              size={17}
            />

            {completeLoading
              ? 'Completing...'
              : 'Complete'}
          </button>
        )}

        {(appointment.status ===
          'PENDING' ||
          appointment.status ===
            'CONFIRMED') && (
          <button
            disabled={
              confirmLoading ||
              completeLoading ||
              cancelLoading
            }
            onClick={() =>
              onAction(
                appointment.id,
                'cancel',
              )
            }
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            <XCircle size={17} />

            {cancelLoading
              ? 'Cancelling...'
              : 'Cancel'}
          </button>
        )}

      </div>

    </div>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold">
      {status}
    </span>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <h3 className="mt-1 text-3xl font-bold">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">

      <div className="mt-1 text-slate-600">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );
}

// =====================================================
// EMPTY APPOINTMENTS
// =====================================================

function EmptyAppointments() {
  return (
    <div className="mt-6 rounded-2xl bg-slate-50 p-12 text-center">

      <CalendarCheck
        size={42}
        className="mx-auto text-slate-300"
      />

      <h4 className="mt-4 font-bold">
        No appointments
      </h4>

      <p className="mt-2 text-sm text-slate-500">
        Customer bookings will appear here.
      </p>

    </div>
  );
}

// =====================================================
// LOADING
// =====================================================

function LoadingCard() {
  return (
    <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

      <p className="mt-5 text-sm text-slate-500">
        Loading salon dashboard...
      </p>

    </div>
  );
}

// =====================================================
// ERROR MESSAGE
// =====================================================

function getErrorMessage(
  error: any,
  fallback: string,
) {
  const message =
    error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return (
    message ||
    fallback
  );
}

// =====================================================
// SHIELD
// =====================================================

function ShieldIcon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
      <Sparkles size={25} />
    </div>
  );
}

// =====================================================
// DAY NAME
// =====================================================

function getDayName(
  dayOfWeek: number,
) {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  return (
    days[dayOfWeek] ||
    'Unknown Day'
  );
}

// =====================================================
// STAFF NAME
// =====================================================

function getStaffName(
  staffId: string | null,
  staff: Staff[],
) {
  const found =
    staff.find(
      (item) =>
        item.id === staffId,
    );

  return (
    found?.name ||
    'Salon Staff'
  );
}

// =====================================================
// DATE
// =====================================================

function formatDate(
  date: string,
) {
  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

// =====================================================
// TIME
// =====================================================

function formatTime(
  value: string,
) {
  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return value;
  }

  return parsed.toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

export default Dashboard;