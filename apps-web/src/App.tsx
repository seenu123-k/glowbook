import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Home from './pages/home';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';

import SalonDetails from './pages/SalonDetails';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';

// =====================================================
// TYPES
// =====================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

// =====================================================
// GET LOGGED-IN USER
// =====================================================

function getLoggedInUser() {
  const storedUser =
    localStorage.getItem('user');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(
      storedUser,
    );
  } catch {
    return null;
  }
}

// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token =
    localStorage.getItem(
      'accessToken',
    );

  // No token
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const user =
    getLoggedInUser();

  // Token exists but user data missing/invalid
  if (!user) {
    localStorage.removeItem(
      'accessToken',
    );

    localStorage.removeItem(
      'user',
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ===================================================
  // ROLE NOT ALLOWED
  // ===================================================

  if (
    !allowedRoles.includes(
      user.role,
    )
  ) {
    // ADMIN
    if (
      user.role === 'ADMIN'
    ) {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    // SALON OWNER
    if (
      user.role ===
      'SALON_OWNER'
    ) {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }

    // CUSTOMER
    if (
      user.role ===
      'CUSTOMER'
    ) {
      return (
        <Navigate
          to="/customer"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <>{children}</>;
}

// =====================================================
// LOGIN REDIRECT
// =====================================================

function RoleRedirect() {
  const token =
    localStorage.getItem(
      'accessToken',
    );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const user =
    getLoggedInUser();

  if (!user) {
    localStorage.removeItem(
      'accessToken',
    );

    localStorage.removeItem(
      'user',
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ADMIN
  if (
    user.role === 'ADMIN'
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  // SALON OWNER
  if (
    user.role ===
    'SALON_OWNER'
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // CUSTOMER
  if (
    user.role ===
    'CUSTOMER'
  ) {
    return (
      <Navigate
        to="/customer"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/login"
      replace
    />
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <Routes>

      {/* ==============================================
          HOME
      ============================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      {/* ==============================================
          LOGIN
      ============================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ==============================================
          REGISTER
      ============================================== */}

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ==============================================
          SALON OWNER DASHBOARD
      ============================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              'SALON_OWNER',
            ]}
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ==============================================
          CUSTOMER DASHBOARD
      ============================================== */}

      <Route
        path="/customer"
        element={
          <ProtectedRoute
            allowedRoles={[
              'CUSTOMER',
            ]}
          >
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==============================================
          ADMIN DASHBOARD
      ============================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={[
              'ADMIN',
            ]}
          >
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==============================================
          SALON DETAILS
          Public
      ============================================== */}

      <Route
        path="/salon/:id"
        element={
          <SalonDetails />
        }
      />

      {/* ==============================================
          BOOKING
          CUSTOMER ONLY
      ============================================== */}

      <Route
        path="/booking"
        element={
          <ProtectedRoute
            allowedRoles={[
              'CUSTOMER',
            ]}
          >
            <Booking />
          </ProtectedRoute>
        }
      />

      {/* ==============================================
          MY BOOKINGS
          CUSTOMER ONLY
      ============================================== */}

      <Route
        path="/bookings"
        element={
          <ProtectedRoute
            allowedRoles={[
              'CUSTOMER',
            ]}
          >
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* ==============================================
          FALLBACK
      ============================================== */}

      <Route
        path="*"
        element={
          <RoleRedirect />
        }
      />

    </Routes>
  );
}

export default App;