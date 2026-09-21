import { useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Clock,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import api from '../services/api';

type Section =
  | 'dashboard'
  | 'users'
  | 'salons'
  | 'services'
  | 'appointments'
  | 'reviews';

type UserRole =
  | 'CUSTOMER'
  | 'SALON_OWNER'
  | 'SALON_MANAGER'
  | 'STAFF';

type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED';

type SalonStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED';

type ServiceStatus =
  | 'ACTIVE'
  | 'INACTIVE';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
}

interface Owner {
  id: string;
  name: string;
  email: string;
}

interface Salon {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city: string;
  state?: string;
  postalCode?: string;
  image?: string;
  status: SalonStatus;
  owner?: Owner;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  status: boolean;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  durationMinutes: number;
  image?: string;
  status: ServiceStatus;
  salon?: {
    id: string;
    name: string;
    city?: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

interface DashboardData {
  totalUsers: number;
  totalCustomers: number;
  totalSalonOwners: number;
  totalStaffUsers: number;
  totalSalons: number;
  totalServices: number;
  totalCategories: number;
  totalStaff: number;
  totalAppointments: number;
  totalReviews: number;
  activeUsers: number;
  activeSalons: number;
  activeServices: number;
  activeStaff: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingReviews: number;
  totalRevenue: number;
}

interface AppointmentStatusType {
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';
}

interface Appointment {
  id: string;
  customerId: string;
  salonId: string;
  serviceId: string;
  staffId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatusType['status'];
  price: number | string;
  notes?: string | null;
  cancellationReason?: string | null;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  salon?: {
    id?: string;
    name?: string;
  };
  service?: {
    id?: string;
    name?: string;
  };
  staff?: {
    id?: string;
    name?: string;
  };
}

interface Review {
  id: string;
  customerId: string;
  salonId: string;
  appointmentId: string;
  rating: number;
  comment?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
  };
  salon?: {
    id?: string;
    name?: string;
    city?: string;
  };
  appointment?: {
    id?: string;
    appointmentDate?: string;
    startTime?: string;
    status?: string;
  };
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

interface SalonForm {
  ownerId: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  image: string;
}

interface ServiceForm {
  salonId: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  image: string;
}

const emptyUserForm: UserForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'CUSTOMER',
};

const emptySalonForm: SalonForm = {
  ownerId: '',
  name: '',
  description: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  image: '',
};

const emptyServiceForm: ServiceForm = {
  salonId: '',
  categoryId: '',
  name: '',
  description: '',
  price: '',
  durationMinutes: '',
  image: '',
};

export default function AdminDashboard() {
  const [section, setSection] =
    useState<Section>('dashboard');

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [users, setUsers] =
    useState<User[]>([]);

  const [salons, setSalons] =
    useState<Salon[]>([]);

  const [services, setServices] =
    useState<Service[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [showUserForm, setShowUserForm] =
    useState(false);

  const [showSalonForm, setShowSalonForm] =
    useState(false);

  const [showServiceForm, setShowServiceForm] =
    useState(false);

  const [editingUserId, setEditingUserId] =
    useState<string | null>(null);

  const [editingSalonId, setEditingSalonId] =
    useState<string | null>(null);

  const [editingServiceId, setEditingServiceId] =
    useState<string | null>(null);

  const [userForm, setUserForm] =
    useState<UserForm>(emptyUserForm);

  const [showUserPassword, setShowUserPassword] =
    useState(false);

  const [salonForm, setSalonForm] =
    useState<SalonForm>(emptySalonForm);

  const [serviceForm, setServiceForm] =
    useState<ServiceForm>(
      emptyServiceForm,
    );

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      const response =
        await api.get('/admin/dashboard');

      setDashboard(
        response.data?.data ?? null,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load dashboard',
      );
    }
  };

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    try {
      const response =
        await api.get('/admin/users');

      setUsers(
        response.data?.data ?? [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load users',
      );
    }
  };

  // =====================================================
  // LOAD SALONS
  // =====================================================

  const loadSalons = async () => {
    try {
      const response =
        await api.get('/admin/salons');

      setSalons(
        response.data?.data ?? [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load salons',
      );
    }
  };

  // =====================================================
  // LOAD SERVICES
  // =====================================================

  const loadServices = async () => {
    try {
      const response =
        await api.get('/admin/services');

      setServices(
        response.data?.data ?? [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load services',
      );
    }
  };

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const loadCategories = async () => {
    try {
      const response =
        await api.get('/admin/categories');

      setCategories(
        response.data?.data ?? [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load categories',
      );
    }
  };

  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  const loadAppointments = async () => {
    try {
      const response =
        await api.get('/admin/appointments');

      setAppointments(
        Array.isArray(response.data?.data)
          ? response.data.data
          : [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load appointments',
      );
    }
  };

  // =====================================================
  // LOAD REVIEWS
  // =====================================================

  const loadReviews = async () => {
    try {
      const response =
        await api.get('/admin/reviews');

      setReviews(
        Array.isArray(response.data?.data)
          ? response.data.data
          : [],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load reviews',
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');

      await Promise.all([
        loadDashboard(),
        loadUsers(),
        loadSalons(),
        loadServices(),
        loadCategories(),
        loadAppointments(),
        loadReviews(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // =====================================================
  // USER
  // =====================================================

  const openAddUser = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setShowUserPassword(false);
    setShowUserForm(true);
  };

  const openEditUser = (user: User) => {
    setEditingUserId(user.id);

    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone ?? '',
      role: user.role,
    });

    setShowUserPassword(false);
    setShowUserForm(true);
  };

  const saveUser = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (editingUserId) {
        await api.patch(
          `/admin/users/${editingUserId}`,
          {
            name: userForm.name,
            email: userForm.email,
            phone: userForm.phone,
            role: userForm.role,
          },
        );
      } else {
        await api.post('/admin/users', {
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          phone: userForm.phone,
          role: userForm.role,
        });
      }

      setShowUserForm(false);
      setEditingUserId(null);
      setUserForm(emptyUserForm);

      await Promise.all([
        loadUsers(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to save user',
      );
    } finally {
      setSaving(false);
    }
  };

  const updateUserStatus = async (
    id: string,
    status: UserStatus,
  ) => {
    try {
      await api.patch(
        `/admin/users/${id}/status`,
        { status },
      );

      await Promise.all([
        loadUsers(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to update user',
      );
    }
  };

  const deleteUser = async (
    id: string,
  ) => {
    if (
      !window.confirm(
        'Delete this user?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/admin/users/${id}`,
      );

      await Promise.all([
        loadUsers(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to delete user',
      );
    }
  };

  // =====================================================
  // SALON
  // =====================================================

  const openAddSalon = () => {
    setEditingSalonId(null);
    setSalonForm(emptySalonForm);
    setShowSalonForm(true);
  };

  const openEditSalon = (
    salon: Salon,
  ) => {
    setEditingSalonId(salon.id);

    setSalonForm({
      ownerId: salon.owner?.id ?? '',
      name: salon.name,
      description:
        salon.description ?? '',
      phone: salon.phone ?? '',
      email: salon.email ?? '',
      address: salon.address ?? '',
      city: salon.city ?? '',
      state: salon.state ?? '',
      postalCode:
        salon.postalCode ?? '',
      image: salon.image ?? '',
    });

    setShowSalonForm(true);
  };

  const saveSalon = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        ownerId: salonForm.ownerId,
        name: salonForm.name,
        description:
          salonForm.description,
        phone: salonForm.phone,
        email: salonForm.email,
        address: salonForm.address,
        city: salonForm.city,
        state: salonForm.state,
        postalCode:
          salonForm.postalCode,
        image: salonForm.image,
      };

      if (editingSalonId) {
        await api.patch(
          `/admin/salons/${editingSalonId}`,
          payload,
        );
      } else {
        await api.post(
          '/admin/salons',
          payload,
        );
      }

      setShowSalonForm(false);
      setEditingSalonId(null);
      setSalonForm(emptySalonForm);

      await Promise.all([
        loadSalons(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to save salon',
      );
    } finally {
      setSaving(false);
    }
  };

  const updateSalonStatus = async (
    id: string,
    status: SalonStatus,
  ) => {
    try {
      await api.patch(
        `/admin/salons/${id}/status`,
        { status },
      );

      await Promise.all([
        loadSalons(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to update salon',
      );
    }
  };

  const deleteSalon = async (
    id: string,
  ) => {
    if (
      !window.confirm(
        'Delete this salon?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/admin/salons/${id}`,
      );

      await Promise.all([
        loadSalons(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to delete salon',
      );
    }
  };

  // =====================================================
  // SERVICE
  // =====================================================

  const openAddService = () => {
    setEditingServiceId(null);
    setServiceForm(
      emptyServiceForm,
    );
    setShowServiceForm(true);
  };

  const openEditService = (
    service: Service,
  ) => {
    setEditingServiceId(service.id);

    setServiceForm({
      salonId:
        service.salon?.id ?? '',
      categoryId:
        service.category?.id ?? '',
      name: service.name,
      description:
        service.description ?? '',
      price: String(service.price),
      durationMinutes: String(
        service.durationMinutes,
      ),
      image: service.image ?? '',
    });

    setShowServiceForm(true);
  };

  const saveService = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        salonId: serviceForm.salonId,
        categoryId:
          serviceForm.categoryId,
        name: serviceForm.name,
        description:
          serviceForm.description,
        price: Number(
          serviceForm.price,
        ),
        durationMinutes: Number(
          serviceForm.durationMinutes,
        ),
        image: serviceForm.image,
      };

      if (editingServiceId) {
        await api.patch(
          `/admin/services/${editingServiceId}`,
          payload,
        );
      } else {
        await api.post(
          '/admin/services',
          payload,
        );
      }

      setShowServiceForm(false);
      setEditingServiceId(null);
      setServiceForm(
        emptyServiceForm,
      );

      await Promise.all([
        loadServices(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to save service',
      );
    } finally {
      setSaving(false);
    }
  };

  const updateServiceStatus =
    async (
      id: string,
      status: ServiceStatus,
    ) => {
      try {
        await api.patch(
          `/admin/services/${id}/status`,
          { status },
        );

        await Promise.all([
          loadServices(),
          loadDashboard(),
        ]);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Unable to update service',
        );
      }
    };

  const deleteService = async (
    id: string,
  ) => {
    if (
      !window.confirm(
        'Delete this service?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/admin/services/${id}`,
      );

      await Promise.all([
        loadServices(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to delete service',
      );
    }
  };

  // =====================================================
  // APPOINTMENT MANAGEMENT
  // =====================================================

  const updateAppointmentStatus = async (
    id: string,
    status: AppointmentStatusType['status'],
  ) => {
    try {
      setError('');

      await api.patch(
        `/admin/appointments/${id}/status`,
        { status },
      );

      await Promise.all([
        loadAppointments(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to update appointment status',
      );
    }
  };

  // =====================================================
  // REVIEW MANAGEMENT
  // =====================================================

  const updateReviewStatus = async (
    id: string,
    status: Review['status'],
  ) => {
    try {
      setError('');

      await api.patch(
        `/admin/reviews/${id}/status`,
        { status },
      );

      await Promise.all([
        loadReviews(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to update review status',
      );
    }
  };

  const deleteReview = async (
    id: string,
  ) => {
    if (!window.confirm('Delete this review?')) {
      return;
    }

    try {
      setError('');

      await api.delete(`/admin/reviews/${id}`);

      await Promise.all([
        loadReviews(),
        loadDashboard(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to delete review',
      );
    }
  };

  // =====================================================
  // FILTERS
  // =====================================================

  const filteredUsers =
    users.filter((user) => {
      const q =
        search.toLowerCase();

      return (
        user.name
          .toLowerCase()
          .includes(q) ||
        user.email
          .toLowerCase()
          .includes(q) ||
        user.role
          .toLowerCase()
          .includes(q)
      );
    });

  const filteredSalons =
    salons.filter((salon) => {
      const q =
        search.toLowerCase();

      return (
        salon.name
          .toLowerCase()
          .includes(q) ||
        salon.city
          .toLowerCase()
          .includes(q) ||
        salon.owner?.name
          ?.toLowerCase()
          .includes(q)
      );
    });

  const filteredServices =
    services.filter((service) => {
      const q =
        search.toLowerCase();

      return (
        service.name
          .toLowerCase()
          .includes(q) ||
        service.salon?.name
          ?.toLowerCase()
          .includes(q) ||
        service.category?.name
          ?.toLowerCase()
          .includes(q)
      );
    });

  // =====================================================
  // SIDEBAR
  // =====================================================

  const navigation = [
    {
      key: 'dashboard' as Section,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      key: 'users' as Section,
      label: 'Users',
      icon: Users,
    },
    {
      key: 'salons' as Section,
      label: 'Salons',
      icon: Building2,
    },
    {
      key: 'services' as Section,
      label: 'Services',
      icon: Settings,
    },
    {
      key: 'appointments' as Section,
      label: 'Appointments',
      icon: CalendarDays,
    },
    {
      key: 'reviews' as Section,
      label: 'Reviews',
      icon: Star,
    },
  ];

  const goTo = (
    value: Section,
  ) => {
    setSection(value);
    setSearch('');
    setSidebarOpen(false);

    setShowUserForm(false);
    setShowSalonForm(false);
    setShowServiceForm(false);
  };

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: number | string;
    icon: any;
  }) => (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Icon
            size={22}
            className="text-slate-700"
          />
        </div>
      </div>
    </div>
  );

  // =====================================================
  // DASHBOARD VIEW
  // =====================================================

  const DashboardView = () => (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Platform Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-slate-500">
            Manage your entire GlowBook platform.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={
            dashboard?.totalUsers ?? 0
          }
          icon={Users}
        />

        <StatCard
          title="Customers"
          value={
            dashboard?.totalCustomers ?? 0
          }
          icon={CircleUserRound}
        />

        <StatCard
          title="Salon Owners"
          value={
            dashboard?.totalSalonOwners ?? 0
          }
          icon={Building2}
        />

        <StatCard
          title="Total Salons"
          value={
            dashboard?.totalSalons ?? 0
          }
          icon={Building2}
        />

        <StatCard
          title="Services"
          value={
            dashboard?.totalServices ?? 0
          }
          icon={Settings}
        />

        <StatCard
          title="Staff"
          value={
            dashboard?.totalStaff ?? 0
          }
          icon={Users}
        />

        <StatCard
          title="Appointments"
          value={
            dashboard?.totalAppointments ?? 0
          }
          icon={CalendarDays}
        />

        <StatCard
          title="Reviews"
          value={
            dashboard?.totalReviews ?? 0
          }
          icon={Star}
        />
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} />

            <h2 className="font-bold">
              Platform Overview
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <ProgressRow
              label="Active Users"
              value={
                dashboard?.activeUsers ?? 0
              }
              total={
                dashboard?.totalUsers ?? 0
              }
            />

            <ProgressRow
              label="Active Salons"
              value={
                dashboard?.activeSalons ?? 0
              }
              total={
                dashboard?.totalSalons ?? 0
              }
            />

            <ProgressRow
              label="Active Services"
              value={
                dashboard?.activeServices ?? 0
              }
              total={
                dashboard?.totalServices ?? 0
              }
            />

            <ProgressRow
              label="Active Staff"
              value={
                dashboard?.activeStaff ?? 0
              }
              total={
                dashboard?.totalStaff ?? 0
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <CalendarDays size={20} />

            <h2 className="font-bold">
              Appointments
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            <InfoRow
              label="Pending"
              value={
                dashboard?.pendingAppointments ??
                0
              }
            />

            <InfoRow
              label="Confirmed"
              value={
                dashboard?.confirmedAppointments ??
                0
              }
            />

            <InfoRow
              label="Completed"
              value={
                dashboard?.completedAppointments ??
                0
              }
            />

            <InfoRow
              label="Cancelled"
              value={
                dashboard?.cancelledAppointments ??
                0
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <Clock size={20} />

            <h2 className="font-bold">
              Platform Revenue
            </h2>
          </div>

          <p className="mt-6 text-4xl font-bold">
            ₹
            {Number(
              dashboard?.totalRevenue ?? 0,
            ).toLocaleString('en-IN')}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            From completed appointments
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Pending Reviews
            </p>

            <p className="mt-1 text-2xl font-bold">
              {dashboard?.pendingReviews ??
                0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // =====================================================
  // USERS VIEW
  // =====================================================

  const UsersView = () => (
    <div>
      <PageHeader
        title="Users"
        description="Manage customers, salon owners, managers and staff."
        onRefresh={loadUsers}
        onAdd={openAddUser}
        addText="Add User"
      />

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search users..."
      />

      {showUserForm && (
        <FormCard
          title={
            editingUserId
              ? 'Edit User'
              : 'Add User'
          }
          onClose={() =>
            setShowUserForm(false)
          }
        >
          <form
            onSubmit={saveUser}
            className="grid gap-4 md:grid-cols-2"
          >
            <Input
              required
              placeholder="Name"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  name: e.target.value,
                })
              }
            />

            <Input
              required
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  email: e.target.value,
                })
              }
            />

            {!editingUserId && (
              <div className="relative">
                <Input
                  required
                  type={
                    showUserPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      password:
                        e.target.value,
                    })
                  }
                  className="pr-12"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowUserPassword(
                      (previous) => !previous,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={
                    showUserPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showUserPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            )}

            <Input
              placeholder="Phone"
              value={userForm.phone}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  phone: e.target.value,
                })
              }
            />

            <Select
              value={userForm.role}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  role: e.target
                    .value as UserRole,
                })
              }
            >
              <option value="CUSTOMER">
                Customer
              </option>
              <option value="SALON_OWNER">
                Salon Owner
              </option>
              <option value="SALON_MANAGER">
                Salon Manager
              </option>
              <option value="STAFF">
                Staff
              </option>
            </Select>

            <SubmitButton
              saving={saving}
              text={
                editingUserId
                  ? 'Update User'
                  : 'Create User'
              }
            />
          </form>
        </FormCard>
      )}

      <TableCard>
        <table className="w-full min-w-[950px]">
          <thead className="border-b bg-slate-50">
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map(
              (user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0"
                >
                  <Td bold>
                    {user.name}
                  </Td>

                  <Td>
                    {user.email}
                  </Td>

                  <Td>
                    {user.phone || '-'}
                  </Td>

                  <Td>
                    <Badge>
                      {user.role}
                    </Badge>
                  </Td>

                  <Td>
                    <select
                      value={user.status}
                      onChange={(e) =>
                        updateUserStatus(
                          user.id,
                          e.target
                            .value as UserStatus,
                        )
                      }
                      className="rounded-lg border px-2 py-1 text-xs"
                    >
                      <option value="ACTIVE">
                        ACTIVE
                      </option>
                      <option value="INACTIVE">
                        INACTIVE
                      </option>
                      <option value="SUSPENDED">
                        SUSPENDED
                      </option>
                    </select>
                  </Td>

                  <Td>
                    <ActionButtons
                      onEdit={() =>
                        openEditUser(
                          user,
                        )
                      }
                      onDelete={() =>
                        deleteUser(
                          user.id,
                        )
                      }
                    />
                  </Td>
                </tr>
              ),
            )}

            {filteredUsers.length ===
              0 && (
              <EmptyRow
                colSpan={6}
                text="No users found."
              />
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );

  // =====================================================
  // SALONS VIEW
  // =====================================================

  const salonOwners = users.filter(
    (user) =>
      user.role === 'SALON_OWNER',
  );

  const SalonsView = () => (
    <div>
      <PageHeader
        title="Salons"
        description="Manage all salons and salon owners."
        onRefresh={loadSalons}
        onAdd={openAddSalon}
        addText="Add Salon"
      />

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search salons..."
      />

      {showSalonForm && (
        <FormCard
          title={
            editingSalonId
              ? 'Edit Salon'
              : 'Add Salon'
          }
          onClose={() =>
            setShowSalonForm(false)
          }
        >
          <form
            onSubmit={saveSalon}
            className="grid gap-4 md:grid-cols-2"
          >
            <Select
              required
              value={salonForm.ownerId}
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  ownerId:
                    e.target.value,
                })
              }
            >
              <option value="">
                Select Salon Owner
              </option>

              {salonOwners.map(
                (owner) => (
                  <option
                    key={owner.id}
                    value={owner.id}
                  >
                    {owner.name} —{' '}
                    {owner.email}
                  </option>
                ),
              )}
            </Select>

            <Input
              required
              placeholder="Salon Name"
              value={salonForm.name}
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  name: e.target.value,
                })
              }
            />

            <Input
              placeholder="Phone"
              value={salonForm.phone}
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  phone: e.target.value,
                })
              }
            />

            <Input
              type="email"
              placeholder="Email"
              value={salonForm.email}
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  email: e.target.value,
                })
              }
            />

            <Input
              required
              placeholder="Address"
              value={salonForm.address}
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  address:
                    e.target.value,
                })
              }
            />

            <Input
              required
              placeholder="City"
              value={salonForm.city}
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  city: e.target.value,
                })
              }
            />

            <Input
              placeholder="State"
              value={salonForm.state}
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  state:
                    e.target.value,
                })
              }
            />

            <Input
              placeholder="Postal Code"
              value={
                salonForm.postalCode
              }
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  postalCode:
                    e.target.value,
                })
              }
            />

            <Input
              placeholder="Image URL"
              value={salonForm.image}
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  image: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Description"
              value={
                salonForm.description
              }
              onChange={(e) =>
                setSalonForm({
                  ...salonForm,
                  description:
                    e.target.value,
                })
              }
              className="rounded-xl border p-3 md:col-span-2"
              rows={4}
            />

            <SubmitButton
              saving={saving}
              text={
                editingSalonId
                  ? 'Update Salon'
                  : 'Create Salon'
              }
            />
          </form>
        </FormCard>
      )}

      <TableCard>
        <table className="w-full min-w-[1100px]">
          <thead className="border-b bg-slate-50">
            <tr>
              <Th>Salon</Th>
              <Th>Owner</Th>
              <Th>Location</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredSalons.map(
              (salon) => (
                <tr
                  key={salon.id}
                  className="border-b last:border-0"
                >
                  <Td bold>
                    {salon.name}
                  </Td>

                  <Td>
                    <p className="font-medium">
                      {salon.owner?.name ||
                        '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {salon.owner?.email ||
                        '-'}
                    </p>
                  </Td>

                  <Td>
                    {salon.city}
                    {salon.state
                      ? `, ${salon.state}`
                      : ''}
                  </Td>

                  <Td>
                    {salon.phone || '-'}
                  </Td>

                  <Td>
                    <select
                      value={
                        salon.status
                      }
                      onChange={(e) =>
                        updateSalonStatus(
                          salon.id,
                          e.target
                            .value as SalonStatus,
                        )
                      }
                      className="rounded-lg border px-2 py-1 text-xs"
                    >
                      <option value="ACTIVE">
                        ACTIVE
                      </option>
                      <option value="INACTIVE">
                        INACTIVE
                      </option>
                      <option value="SUSPENDED">
                        SUSPENDED
                      </option>
                    </select>
                  </Td>

                  <Td>
                    <ActionButtons
                      onEdit={() =>
                        openEditSalon(
                          salon,
                        )
                      }
                      onDelete={() =>
                        deleteSalon(
                          salon.id,
                        )
                      }
                    />
                  </Td>
                </tr>
              ),
            )}

            {filteredSalons.length ===
              0 && (
              <EmptyRow
                colSpan={6}
                text="No salons found."
              />
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );

  // =====================================================
  // SERVICES VIEW
  // =====================================================

  const ServicesView = () => (
    <div>
      <PageHeader
        title="Services"
        description="Manage salon services, categories, prices and durations."
        onRefresh={loadServices}
        onAdd={openAddService}
        addText="Add Service"
      />

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search services..."
      />

      {showServiceForm && (
        <FormCard
          title={
            editingServiceId
              ? 'Edit Service'
              : 'Add Service'
          }
          onClose={() =>
            setShowServiceForm(false)
          }
        >
          <form
            onSubmit={saveService}
            className="grid gap-4 md:grid-cols-2"
          >
            <Select
              required
              value={
                serviceForm.salonId
              }
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  salonId:
                    e.target.value,
                })
              }
            >
              <option value="">
                Select Salon
              </option>

              {salons.map((salon) => (
                <option
                  key={salon.id}
                  value={salon.id}
                >
                  {salon.name}
                </option>
              ))}
            </Select>

            <Select
              required
              value={
                serviceForm.categoryId
              }
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  categoryId:
                    e.target.value,
                })
              }
            >
              <option value="">
                Select Category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ),
              )}
            </Select>

            <Input
              required
              placeholder="Service Name"
              value={
                serviceForm.name
              }
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  name: e.target.value,
                })
              }
            />

            <Input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={
                serviceForm.price
              }
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  price: e.target.value,
                })
              }
            />

            <Input
              required
              type="number"
              min="1"
              placeholder="Duration in minutes"
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
            />

            <Input
              placeholder="Image URL"
              value={
                serviceForm.image
              }
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  image: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Description"
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
              className="rounded-xl border p-3 md:col-span-2"
              rows={4}
            />

            <SubmitButton
              saving={saving}
              text={
                editingServiceId
                  ? 'Update Service'
                  : 'Create Service'
              }
            />
          </form>
        </FormCard>
      )}

      <TableCard>
        <table className="w-full min-w-[1100px]">
          <thead className="border-b bg-slate-50">
            <tr>
              <Th>Service</Th>
              <Th>Salon</Th>
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Duration</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredServices.map(
              (service) => (
                <tr
                  key={service.id}
                  className="border-b last:border-0"
                >
                  <Td bold>
                    {service.name}
                  </Td>

                  <Td>
                    {service.salon?.name ||
                      '-'}
                  </Td>

                  <Td>
                    {service.category
                      ?.name || '-'}
                  </Td>

                  <Td bold>
                    ₹
                    {Number(
                      service.price,
                    ).toLocaleString(
                      'en-IN',
                    )}
                  </Td>

                  <Td>
                    {
                      service.durationMinutes
                    }{' '}
                    min
                  </Td>

                  <Td>
                    <select
                      value={
                        service.status
                      }
                      onChange={(e) =>
                        updateServiceStatus(
                          service.id,
                          e.target
                            .value as ServiceStatus,
                        )
                      }
                      className="rounded-lg border px-2 py-1 text-xs"
                    >
                      <option value="ACTIVE">
                        ACTIVE
                      </option>
                      <option value="INACTIVE">
                        INACTIVE
                      </option>
                    </select>
                  </Td>

                  <Td>
                    <ActionButtons
                      onEdit={() =>
                        openEditService(
                          service,
                        )
                      }
                      onDelete={() =>
                        deleteService(
                          service.id,
                        )
                      }
                    />
                  </Td>
                </tr>
              ),
            )}

            {filteredServices.length ===
              0 && (
              <EmptyRow
                colSpan={7}
                text="No services found."
              />
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );

  // =====================================================
  // APPOINTMENTS VIEW
  // =====================================================

  const AppointmentsView = () => {
    const filteredAppointments =
      appointments.filter((appointment) => {
        const q = search.toLowerCase();

        return (
          appointment.customer?.name
            ?.toLowerCase()
            .includes(q) ||
          appointment.customer?.email
            ?.toLowerCase()
            .includes(q) ||
          appointment.salon?.name
            ?.toLowerCase()
            .includes(q) ||
          appointment.service?.name
            ?.toLowerCase()
            .includes(q) ||
          appointment.staff?.name
            ?.toLowerCase()
            .includes(q) ||
          appointment.status
            .toLowerCase()
            .includes(q)
        );
      });

    return (
      <div>
        <PageHeader
          title="Appointments"
          description="View and manage all platform appointments."
          onRefresh={loadAppointments}
          onAdd={() => undefined}
          addText=""
        />

        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search appointments..."
        />

        <TableCard>
          <table className="w-full min-w-[1250px]">
            <thead className="border-b bg-slate-50">
              <tr>
                <Th>Customer</Th>
                <Th>Salon</Th>
                <Th>Service</Th>
                <Th>Staff</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Price</Th>
                <Th>Status</Th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b last:border-0"
                >
                  <Td bold>
                    <div>
                      <p>{appointment.customer?.name || '-'}</p>
                      <p className="text-xs font-normal text-slate-400">
                        {appointment.customer?.email || '-'}
                      </p>
                    </div>
                  </Td>

                  <Td>
                    {appointment.salon?.name || '-'}
                  </Td>

                  <Td>
                    {appointment.service?.name || '-'}
                  </Td>

                  <Td>
                    {appointment.staff?.name || '-'}
                  </Td>

                  <Td>
                    {formatDate(appointment.appointmentDate)}
                  </Td>

                  <Td>
                    {formatTime(appointment.startTime)}
                    {' - '}
                    {formatTime(appointment.endTime)}
                  </Td>

                  <Td bold>
                    ₹{Number(appointment.price || 0).toLocaleString('en-IN')}
                  </Td>

                  <Td>
                    <select
                      value={appointment.status}
                      onChange={(e) =>
                        updateAppointmentStatus(
                          appointment.id,
                          e.target.value as AppointmentStatusType['status'],
                        )
                      }
                      className="rounded-lg border px-2 py-1 text-xs font-semibold"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="NO_SHOW">NO_SHOW</option>
                    </select>
                  </Td>
                </tr>
              ))}

              {filteredAppointments.length === 0 && (
                <EmptyRow
                  colSpan={8}
                  text="No appointments found."
                />
              )}
            </tbody>
          </table>
        </TableCard>
      </div>
    );
  };

  // =====================================================
  // REVIEWS VIEW
  // =====================================================

  const ReviewsView = () => {
    const filteredReviews =
      reviews.filter((review) => {
        const q = search.toLowerCase();

        return (
          review.customer?.name
            ?.toLowerCase()
            .includes(q) ||
          review.customer?.email
            ?.toLowerCase()
            .includes(q) ||
          review.salon?.name
            ?.toLowerCase()
            .includes(q) ||
          review.comment
            ?.toLowerCase()
            .includes(q) ||
          review.status
            .toLowerCase()
            .includes(q)
        );
      });

    return (
      <div>
        <PageHeader
          title="Reviews"
          description="Review customer feedback and manage approval status."
          onRefresh={loadReviews}
          onAdd={() => undefined}
          addText=""
        />

        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search reviews..."
        />

        <TableCard>
          <table className="w-full min-w-[1200px]">
            <thead className="border-b bg-slate-50">
              <tr>
                <Th>Customer</Th>
                <Th>Salon</Th>
                <Th>Rating</Th>
                <Th>Comment</Th>
                <Th>Appointment</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-b align-top last:border-0"
                >
                  <Td bold>
                    <div>
                      <p>{review.customer?.name || '-'}</p>
                      <p className="text-xs font-normal text-slate-400">
                        {review.customer?.email || '-'}
                      </p>
                    </div>
                  </Td>

                  <Td>
                    <p className="font-semibold">
                      {review.salon?.name || '-'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {review.salon?.city || ''}
                    </p>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1">
                      <Star size={15} fill="currentColor" />
                      <span className="font-bold">
                        {review.rating}/5
                      </span>
                    </div>
                  </Td>

                  <Td>
                    <div className="max-w-[360px] whitespace-normal">
                      {review.comment || 'No comment'}
                    </div>
                  </Td>

                  <Td>
                    {review.appointment?.appointmentDate
                      ? formatDate(
                          review.appointment.appointmentDate,
                        )
                      : review.appointmentId}
                  </Td>

                  <Td>
                    <select
                      value={review.status}
                      onChange={(e) =>
                        updateReviewStatus(
                          review.id,
                          e.target.value as Review['status'],
                        )
                      }
                      className="rounded-lg border px-2 py-1 text-xs font-semibold"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </Td>

                  <Td>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Td>
                </tr>
              ))}

              {filteredReviews.length === 0 && (
                <EmptyRow
                  colSpan={7}
                  text="No reviews found."
                />
              )}
            </tbody>
          </table>
        </TableCard>
      </div>
    );
  };

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b px-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                GlowBook
              </h2>

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin Panel
              </p>
            </div>

            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="lg:hidden"
            >
              <X />
            </button>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  section === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() =>
                      goTo(
                        item.key,
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition ${
                      active
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={19} />

                    <span>
                      {item.label}
                    </span>

                    {active && (
                      <ChevronRight
                        size={16}
                        className="ml-auto"
                      />
                    )}
                  </button>
                );
              },
            )}
          </nav>

          <div className="border-t p-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                Platform Administrator
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Full system access
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENT */}

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-xl border p-2 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                GlowBook
              </p>

              <p className="font-bold text-slate-900">
                Administration
              </p>
            </div>
          </div>

          <button
            onClick={loadAll}
            className="rounded-xl border p-2"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <span>
                {Array.isArray(error)
                  ? error.join(', ')
                  : error}
              </span>

              <button
                onClick={() =>
                  setError('')
                }
              >
                <X size={17} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="text-center">
                <RefreshCw
                  size={30}
                  className="mx-auto animate-spin text-slate-500"
                />

                <p className="mt-3 text-slate-500">
                  Loading admin dashboard...
                </p>
              </div>
            </div>
          ) : (
            <>
              {section === 'dashboard' && DashboardView()}

              {section === 'users' && UsersView()}

              {section === 'salons' && SalonsView()}

              {section === 'services' && ServicesView()}

              {section === 'appointments' && AppointmentsView()}

              {section === 'reviews' && ReviewsView()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// =====================================================
// DATE/TIME HELPERS
// =====================================================

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// =====================================================
// SMALL COMPONENTS
// =====================================================

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.min(
          100,
          Math.round(
            (value / total) * 100,
          ),
        )
      : 0;

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">
          {label}
        </span>

        <span className="font-semibold">
          {value}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="font-bold">
        {value}
      </span>
    </div>
  );
}

function PageHeader({
  title,
  description,
  onRefresh,
  onAdd,
  addText,
}: {
  title: string;
  description: string;
  onRefresh: () => void;
  onAdd: () => void;
  addText: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          {title}
        </h1>

        <p className="mt-1 text-slate-500">
          {description}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

        {addText && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white"
          >
            <Plus size={18} />
            {addText}
          </button>
        )}
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <Search
          size={19}
          className="text-slate-400"
        />

        <input
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value,
            )
          }
          placeholder={placeholder}
          className="w-full outline-none"
        />
      </div>
    </div>
  );
}

function FormCard({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <button
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <X size={19} />
        </button>
      </div>

      {children}
    </div>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={`rounded-xl border p-3 outline-none focus:ring-2 focus:ring-slate-200 ${
        props.className ?? ''
      }`}
    />
  );
}

function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={`rounded-xl border bg-white p-3 outline-none focus:ring-2 focus:ring-slate-200 ${
        props.className ?? ''
      }`}
    />
  );
}

function SubmitButton({
  saving,
  text,
}: {
  saving: boolean;
  text: string;
}) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="rounded-xl bg-slate-950 p-3 font-semibold text-white disabled:opacity-50 md:col-span-2"
    >
      {saving
        ? 'Saving...'
        : text}
    </button>
  );
}

function TableCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-3xl border bg-white shadow-sm">
      {children}
    </div>
  );
}

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="p-4 text-left text-sm font-bold text-slate-600">
      {children}
    </th>
  );
}

function Td({
  children,
  bold = false,
}: {
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <td
      className={`p-4 text-sm ${
        bold
          ? 'font-semibold text-slate-900'
          : 'text-slate-600'
      }`}
    >
      {children}
    </td>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
      {children}
    </span>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onEdit}
        className="rounded-lg border p-2 hover:bg-slate-100"
        title="Edit"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={onDelete}
        className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function EmptyRow({
  colSpan,
  text,
}: {
  colSpan: number;
  text: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="p-10 text-center text-slate-500"
      >
        {text}
      </td>
    </tr>
  );
}