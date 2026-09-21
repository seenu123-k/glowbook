import React, { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ======================================================
// API
// ======================================================

const API_URL =
  'https://glowbook-production-b29b.up.railway.app';

// ======================================================
// TYPES
// ======================================================

type Screen =
  | 'login'
  | 'register'
  | 'home'
  | 'details'
  | 'services'
  | 'staff'
  | 'date'
  | 'time'
  | 'success'
  | 'myBookings';

type Appointment = {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  price?: number | string;
  notes?: string;
  cancellationReason?: string;
  salon?: { name?: string };
  service?: {
    name?: string;
    durationMinutes?: number;
    price?: number | string;
  };
  staff?: { name?: string };
};

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
};

type Salon = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  phone?: string;
  email?: string;
  rating?: number | string;
  reviewCount?: number;
};

type Service = {
  id: string;
  name: string;
  description?: string;
  price?: number | string;
  durationMinutes?: number;
  status?: string;
};

type Staff = {
  id: string;
  salonId?: string;
  name: string;
  bio?: string;
  specialization?: string;
  profileImage?: string;
  experienceYears?: number;
  status?: string;

  user?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status?: string;
  };
};

// ======================================================
// APP
// ======================================================

export default function App() {
  // ====================================================
  // SCREEN
  // ====================================================

  const [screen, setScreen] =
    useState<Screen>('login');

  // ====================================================
  // LOGIN
  // ====================================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [user, setUser] =
    useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  // ====================================================
  // SALON
  // ====================================================

  const [salons, setSalons] =
    useState<Salon[]>([]);

  const [selectedSalon, setSelectedSalon] =
    useState<Salon | null>(null);

  const [search, setSearch] = useState('');

  // ====================================================
  // SERVICES
  // ====================================================

  const [services, setServices] =
    useState<Service[]>([]);

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [servicesLoading, setServicesLoading] =
    useState(false);

  // ====================================================
  // STAFF
  // ====================================================

  const [staff, setStaff] =
    useState<Staff[]>([]);

  const [selectedStaff, setSelectedStaff] =
    useState<Staff | null>(null);

  const [staffLoading, setStaffLoading] =
    useState(false);

  // ====================================================
  // DATE
  // ====================================================

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  // ====================================================
  // TIME
  // ====================================================

  const [selectedTime, setSelectedTime] =
    useState<string | null>(null);

  const [myBookings, setMyBookings] = useState<any[]>([]);


  // ====================================================
  // LOGIN
  // ====================================================

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Required',
        'Please enter email and password.',
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Invalid email or password',
        );
      }

      const loginUser =
        result?.data?.user;

      const token =
        result?.data?.accessToken;

      if (!loginUser) {
        throw new Error(
          'User information not received.',
        );
      }

      if (
        loginUser.role !==
        'CUSTOMER'
      ) {
        Alert.alert(
          'Access Denied',
          'This mobile app is only for customers.',
        );
        return;
      }

      setUser(loginUser);
      setAccessToken(token || null);

      await fetchSalons();

      setScreen('home');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error?.message ||
          'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // REGISTER
  // ====================================================

  const register = async () => {
    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPhone.trim() ||
      !registerPassword.trim()
    ) {
      Alert.alert('Required', 'Please fill all fields.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: registerName.trim(),
            email: registerEmail.trim(),
            phone: registerPhone.trim(),
            password: registerPassword,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || 'Registration failed.',
        );
      }

      Alert.alert(
        'Registration Successful',
        'Your customer account has been created. Please login.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail(registerEmail.trim());
              setPassword('');
              setRegisterName('');
              setRegisterEmail('');
              setRegisterPhone('');
              setRegisterPassword('');
              setScreen('login');
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.message || 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // GET SALONS
  // ====================================================

  const fetchSalons = async () => {
    try {
      const response =
        await fetch(
          `${API_URL}/salons`,
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Unable to load salons.',
        );
      }

      const salonData =
        result?.data?.data ||
        result?.data ||
        result?.salons ||
        [];

      setSalons(
        Array.isArray(salonData)
          ? salonData
          : [],
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'Unable to load salons.',
      );
    }
  };

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredSalons = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return salons;
    }

    return salons.filter(
      (salon) =>
        salon.name
          ?.toLowerCase()
          .includes(keyword) ||
        salon.description
          ?.toLowerCase()
          .includes(keyword) ||
        salon.slug
          ?.toLowerCase()
          .includes(keyword),
    );
  }, [salons, search]);

  // ====================================================
  // OPEN SALON
  // ====================================================

  const openSalon = (
    salon: Salon,
  ) => {
    setSelectedSalon(salon);

    setSelectedService(null);

    setSelectedStaff(null);

    setSelectedDate(null);

    setServices([]);

    setStaff([]);

    setScreen('details');
  };

  // ====================================================
  // GET SERVICES
  // ====================================================

  const fetchServices = async (
    salonId: string,
  ) => {
    try {
      setServicesLoading(true);

      const response =
        await fetch(
          `${API_URL}/services/salon/${salonId}`,
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Unable to load services.',
        );
      }

      const serviceData =
        result?.data?.data ||
        result?.data ||
        result?.services ||
        [];

      setServices(
        Array.isArray(serviceData)
          ? serviceData
          : [],
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ||
          'Unable to load services.',
      );
    } finally {
      setServicesLoading(false);
    }
  };

  // ====================================================
  // OPEN SERVICES
  // ====================================================

  const openServices = async () => {
    if (!selectedSalon) {
      return;
    }

    setSelectedService(null);

    setServices([]);

    setScreen('services');

    await fetchServices(
      selectedSalon.id,
    );
  };

  // ====================================================
  // SELECT ONE SERVICE
  // ====================================================

  const selectService = (service: Service) => {
    setSelectedService(service);
  };

  // ====================================================
  // TOTAL PRICE
  // ====================================================

  const totalPrice = selectedService
    ? Number(selectedService.price || 0)
    : 0;

  // ====================================================
  // TOTAL DURATION
  // ====================================================

  const totalDuration = selectedService
    ? Number(selectedService.durationMinutes || 0)
    : 0;

  // ====================================================
  // GET STAFF
  // ====================================================

  const fetchStaff = async (
    salonId: string,
  ) => {
    try {
      setStaffLoading(true);

      const url =
        `${API_URL}/staff/salon/${salonId}`;

      console.log(
        'STAFF API:',
        url,
      );

      const response =
        await fetch(url);

      const result =
        await response.json();

      console.log(
        'STAFF RESPONSE:',
        result,
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Unable to load staff.',
        );
      }

      // Backend:
      // {
      //   success: true,
      //   data: [...]
      // }

      const staffData =
        Array.isArray(result?.data)
          ? result.data
          : Array.isArray(
              result?.data?.data,
            )
          ? result.data.data
          : [];

      console.log(
        'STAFF ARRAY:',
        staffData,
      );

      setStaff(staffData);
    } catch (error: any) {
      console.log(
        'STAFF ERROR:',
        error,
      );

      setStaff([]);

      Alert.alert(
        'Staff Error',
        error?.message ||
          'Unable to load staff.',
      );
    } finally {
      setStaffLoading(false);
    }
  };

  // ====================================================
  // CONTINUE → STAFF
  // ====================================================

  const continueToStaff = async () => {
    if (!selectedService) {
      Alert.alert(
        'Select Service',
        'Please select at least one service.',
      );
      return;
    }

    if (!selectedSalon) {
      Alert.alert(
        'Error',
        'Salon not selected.',
      );
      return;
    }

    // Clear previous staff
    setStaff([]);

    setSelectedStaff(null);

    // IMPORTANT:
    // Open staff screen FIRST
    setScreen('staff');

    // Then fetch API
    await fetchStaff(
      selectedSalon.id,
    );
  };

  // ====================================================
  // SELECT STAFF
  // ====================================================

  const selectStaff = (
    item: Staff,
  ) => {
    setSelectedStaff(item);
  };

  // ====================================================
  // CONTINUE → DATE
  // ====================================================

  const continueAfterStaff = () => {
    if (!selectedStaff) {
      Alert.alert(
        'Select Stylist',
        'Please select a stylist.',
      );
      return;
    }

    setSelectedDate(null);
    setSelectedTime(null);

    setScreen('date');
  };

  // ====================================================
  // SELECT DATE
  // ====================================================

  const selectDate = (
    date: string,
  ) => {
    setSelectedDate(date);
  };

  // ====================================================
  // CONTINUE AFTER DATE → TIME
  // ====================================================

  const continueAfterDate = () => {
    if (!selectedDate) {
      Alert.alert(
        'Select Date',
        'Please select an appointment date.',
      );
      return;
    }

    setSelectedTime(null);
    setScreen('time');
  };

  // ====================================================
  // SELECT TIME
  // ====================================================

  const selectTime = (time: string) => {
    setSelectedTime(time);
  };

  // ====================================================
  // CONTINUE AFTER TIME
  // ====================================================

  const continueAfterTime = async () => {
    if (!selectedTime) {
      Alert.alert(
        'Select Time',
        'Please select an appointment time.',
      );
      return;
    }

    const success = await createBooking();

    if (success) {
      setScreen('success');
    }
  };


  const formatBookingDate = (value: any) => {
    if (!value) return '-';

    const raw = String(value);

    // Read the calendar date directly from the API ISO string.
    // Do not use new Date(...).toISOString() here because UTC conversion
    // can shift an India-local appointment to the previous day.
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return raw;
  };



  const formatBookingTime = (value: any) => {
    if (!value) return '-';

    const raw = String(value);

    // Convert HH:mm / HH:mm:ss to 12-hour format.
    const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (!match) return raw;

    let hour = Number(match[1]);
    const minute = match[2];
    const period = hour >= 12 ? 'PM' : 'AM';

    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    return `${String(hour).padStart(2, '0')}:${minute} ${period}`;
  };

  const fetchMyBookings = async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/appointments/my`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Unable to load bookings.',
        );
      }

      const appointments: Appointment[] =
        Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.data)
            ? result.data.data
            : [];

      setMyBookings(
        appointments.map((appointment) => ({
          id: appointment.id,
          salonName:
            appointment.salon?.name || '-',
          serviceName:
            appointment.service?.name || '-',
          staffName:
            appointment.staff?.name || '-',
          date: formatBookingDate(
            appointment.appointmentDate ??
              (appointment as any).date,
          ),
          time: formatBookingTime(
            appointment.startTime ??
              (appointment as any).time,
          ),
          endTime:
            appointment.endTime || '',
          duration:
            Number(
              appointment.service?.durationMinutes ||
                0,
            ),
          price:
            Number(
              appointment.price ??
                appointment.service?.price ??
                0,
            ),
          status:
            appointment.status || 'PENDING',
          cancellationReason:
            appointment.cancellationReason || '',
        })),
      );
    } catch (error: any) {
      Alert.alert(
        'My Bookings',
        error?.message ||
          'Unable to load your bookings.',
      );
    }
  };

  const createBooking = async () => {
    if (
      !accessToken ||
      !user ||
      !selectedSalon ||
      !selectedService ||
      !selectedStaff ||
      !selectedDate ||
      !selectedTime
    ) {
      Alert.alert(
        'Booking',
        'Please complete all booking details.',
      );
      return false;
    }

    const to24Hour = (time: string) => {
      const match =
        time.match(
          /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
        );

      if (!match) {
        return null;
      }

      let hour = Number(match[1]);
      const minute = Number(match[2]);
      const period = match[3].toUpperCase();

      if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      if (period === 'PM' && hour !== 12) {
        hour += 12;
      }

      return {
        hour,
        minute,
      };
    };

    const start = to24Hour(selectedTime);

    if (!start) {
      Alert.alert(
        'Booking',
        'Invalid appointment time.',
      );
      return false;
    }

    const startMinutes =
      start.hour * 60 + start.minute;

    const endMinutes =
      startMinutes + totalDuration;

    const endHour =
      Math.floor(endMinutes / 60) % 24;

    const endMinute =
      endMinutes % 60;

    const startTime =
      `${String(start.hour).padStart(2, '0')}:${String(start.minute).padStart(2, '0')}`;

    const endTime =
      `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    // Backend expects ISO 8601 DateTime strings for startTime/endTime.
    // Build the appointment DateTime from the selected date + selected time.
    const [selectedYear, selectedMonth, selectedDay] =
      selectedDate.split('-').map(Number);

    if (
      !Number.isInteger(selectedYear) ||
      !Number.isInteger(selectedMonth) ||
      !Number.isInteger(selectedDay) ||
      selectedMonth < 1 ||
      selectedMonth > 12 ||
      selectedDay < 1 ||
      selectedDay > 31
    ) {
      Alert.alert(
        'Booking',
        'Invalid appointment date or time.',
      );
      return false;
    }

    // IMPORTANT:
    // The backend validates appointmentDate/startTime/endTime by their
    // UTC calendar date (toISOString + getUTCDay). Therefore all three
    // values must be created from the SAME selected YYYY-MM-DD in UTC.
    // Do not use new Date(selectedDate + local time).toISOString(),
    // because that can move appointmentDate to the previous UTC day.
    const startTimeISO = new Date(
      Date.UTC(
        selectedYear,
        selectedMonth - 1,
        selectedDay,
        start.hour,
        start.minute,
        0,
        0,
      ),
    ).toISOString();

    const endTimeISO = new Date(
      Date.UTC(
        selectedYear,
        selectedMonth - 1,
        selectedDay,
        endHour,
        endMinute,
        0,
        0,
      ),
    ).toISOString();

    const appointmentDateISO = new Date(
      Date.UTC(
        selectedYear,
        selectedMonth - 1,
        selectedDay,
        0,
        0,
        0,
        0,
      ),
    ).toISOString();

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/appointments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            salonId: selectedSalon.id,
            serviceId: selectedService.id,
            staffId: selectedStaff.id,
            appointmentDate: appointmentDateISO,
            startTime: startTimeISO,
            endTime: endTimeISO,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Unable to create booking.',
        );
      }

      const saved =
        result?.data?.data ||
        result?.data;

      const booking = {
        id: saved?.id || Date.now().toString(),
        salonName:
          saved?.salon?.name ||
          selectedSalon.name,
        serviceName:
          saved?.service?.name ||
          selectedService.name,
        staffName:
          saved?.staff?.name ||
          selectedStaff.name,
        date:
          saved?.appointmentDate ||
          selectedDate,
        time:
          saved?.startTime ||
          startTime,
        endTime:
          saved?.endTime ||
          endTime,
        duration: totalDuration,
        price:
          Number(
            saved?.price ??
              selectedService.price ??
              0,
          ),
        status:
          saved?.status || 'PENDING',
        cancellationReason:
          saved?.cancellationReason || '',
      };

      setMyBookings((prev) => [
        booking,
        ...prev.filter(
          (item) => item.id !== booking.id,
        ),
      ]);

      Alert.alert(
        'Booking Successful',
        'Your appointment has been confirmed.',
      );

      return true;
    } catch (error: any) {
      Alert.alert(
        'Booking Failed',
        error?.message ||
          'Unable to create booking.',
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            if (!accessToken) {
              Alert.alert(
                'Cancel Booking',
                'Please login again.',
              );
              return;
            }

            try {
              setLoading(true);

              const response = await fetch(
                `${API_URL}/appointments/${bookingId}/cancel`,
                {
                  method: 'PATCH',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    cancellationReason:
                      'Cancelled by customer',
                  }),
                },
              );

              const result =
                await response.json();

              if (!response.ok) {
                throw new Error(
                  result?.message ||
                    'Unable to cancel booking.',
                );
              }

              setMyBookings((prev) =>
                prev.map((booking) =>
                  booking.id === bookingId
                    ? {
                        ...booking,
                        status: 'CANCELLED',
                      }
                    : booking,
                ),
              );

              Alert.alert(
                'Booking Cancelled',
                'Your booking has been cancelled.',
              );
            } catch (error: any) {
              Alert.alert(
                'Cancel Failed',
                error?.message ||
                  'Unable to cancel booking.',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };


  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setMyBookings([]);
    setSalons([]);
    setSelectedSalon(null);
    setServices([]);
    setSelectedService(null);
    setStaff([]);
    setSelectedStaff(null);
    setSelectedDate(null);
    setEmail('');
    setPassword('');
    setSearch('');
    setScreen('login');
  };

  // ====================================================
  // LOGIN SCREEN
  // ====================================================

  if (screen === 'login') {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
        />

        <View
          style={
            styles.loginContainer
          }
        >
          <View
            style={styles.logoCircle}
          >
            <Text
              style={styles.logoText}
            >
              G
            </Text>
          </View>

          <Text
            style={styles.appTitle}
          >
            GlowBook
          </Text>

          <Text
            style={styles.appSubtitle}
          >
            Book your beauty experience
          </Text>

          <View style={styles.form}>
            <Text
              style={styles.label}
            >
              Email
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text
              style={styles.label}
            >
              Password
            </Text>

            <View
              style={
                styles.passwordContainer
              }
            >
              <TextInput
                style={
                  styles.passwordInput
                }
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={
                  setPassword
                }
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword(
                    (value) =>
                      !value,
                  )
                }
              >
                <Text
                  style={styles.eyeText}
                >
                  {showPassword
                    ? '🙈'
                    : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={login}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#fff"
                />
              ) : (
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Login
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerLoginRow}>
              <Text style={styles.registerLoginText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => setScreen('register')}
              >
                <Text style={styles.registerLoginLink}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // REGISTER SCREEN
  // ====================================================

  if (screen === 'register') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.registerContainer}
        >
          <TouchableOpacity
            onPress={() => setScreen('login')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>G</Text>
          </View>

          <Text style={styles.appTitle}>Create Account</Text>
          <Text style={styles.appSubtitle}>
            Register as a GlowBook customer
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={registerName}
              onChangeText={setRegisterName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              value={registerPhone}
              onChangeText={setRegisterPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
                placeholderTextColor="#999"
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry={!showRegisterPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowRegisterPassword((value) => !value)
                }
              >
                <Text style={styles.eyeText}>
                  {showRegisterPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={register}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Register
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerLoginRow}>
              <Text style={styles.registerLoginText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => setScreen('login')}
              >
                <Text style={styles.registerLoginLink}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ====================================================
  // HOME
  // ====================================================

  if (screen === 'home') {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text
                style={
                  styles.headerTitle
                }
              >
                GlowBook
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                Hi,{' '}
                {user?.name ||
                  'Customer'}{' '}
                👋
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.logoutButton
              }
              onPress={logout}
            >
              <Text
                style={
                  styles.logoutText
                }
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={
              styles.searchContainer
            }
          >
            <TextInput
              style={
                styles.searchInput
              }
              placeholder="Search salons..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.myBookingsHomeCard}
            onPress={() => {
              setScreen('myBookings');
              fetchMyBookings();
            }}
          >
            <View style={styles.myBookingsHomeText}>
              <Text style={styles.myBookingsHomeTitle}>
                My Bookings
              </Text>
              <Text style={styles.myBookingsHomeSubtitle}>
                View and manage your appointments
              </Text>
            </View>
            <Text style={styles.myBookingsHomeArrow}>
              ›
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Discover Salons
          </Text>

          <FlatList
            data={filteredSalons}
            keyExtractor={(item) =>
              item.id
            }
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.salonList
            }
            ListEmptyComponent={
              <View
                style={
                  styles.emptyContainer
                }
              >
                <Text
                  style={
                    styles.emptyText
                  }
                >
                  No salons found
                </Text>
              </View>
            }
            renderItem={({
              item,
            }) => (
              <View
                style={
                  styles.salonCard
                }
              >
                {item.image ? (
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={
                      styles.salonImage
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.imagePlaceholder
                    }
                  >
                    <Text
                      style={
                        styles.placeholderText
                      }
                    >
                      No Image
                    </Text>
                  </View>
                )}

                <View
                  style={
                    styles.salonContent
                  }
                >
                  <Text
                    style={
                      styles.salonName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.rating
                    }
                  >
                    ⭐{' '}
                    {Number(
                      item.rating || 0,
                    ).toFixed(1)}
                  </Text>

                  <Text
                    style={
                      styles.salonDescription
                    }
                    numberOfLines={2}
                  >
                    {item.description ||
                      'Beauty and salon services'}
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.viewButton
                    }
                    onPress={() =>
                      openSalon(
                        item,
                      )
                    }
                  >
                    <Text
                      style={
                        styles.viewButtonText
                      }
                    >
                      View Salon
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // SALON DETAILS
  // ====================================================

  if (
    screen === 'details' &&
    selectedSalon
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.page}>
          <View
            style={
              styles.detailHeader
            }
          >
            <TouchableOpacity
              onPress={() =>
                setScreen('home')
              }
              style={
                styles.backButton
              }
            >
              <Text
                style={styles.backText}
              >
                ‹
              </Text>
            </TouchableOpacity>

            <Text
              style={
                styles.detailHeaderTitle
              }
            >
              Salon Details
            </Text>

            <View
              style={
                styles.headerSpace
              }
            />
          </View>

          <FlatList
            data={[selectedSalon]}
            keyExtractor={(item) =>
              item.id
            }
            showsVerticalScrollIndicator={
              false
            }
            renderItem={({
              item,
            }) => (
              <View>
                {item.image ? (
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={
                      styles.detailImage
                    }
                  />
                ) : (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      styles.detailImage,
                    ]}
                  >
                    <Text
                      style={
                        styles.placeholderText
                      }
                    >
                      No Image
                    </Text>
                  </View>
                )}

                <View
                  style={
                    styles.detailContent
                  }
                >
                  <Text
                    style={
                      styles.detailName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.detailRating
                    }
                  >
                    ⭐{' '}
                    {Number(
                      item.rating || 0,
                    ).toFixed(1)}
                  </Text>

                  <Text
                    style={
                      styles.detailDescription
                    }
                  >
                    {item.description ||
                      'Premium salon and beauty services'}
                  </Text>

                  {item.phone && (
                    <Text
                      style={
                        styles.contactText
                      }
                    >
                      📞 {item.phone}
                    </Text>
                  )}

                  {item.email && (
                    <Text
                      style={
                        styles.contactText
                      }
                    >
                      ✉️ {item.email}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={
                      styles.primaryButton
                    }
                    onPress={
                      openServices
                    }
                  >
                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Select Service
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // SERVICES
  // ====================================================

  if (
    screen === 'services'
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.page}>
          <View
            style={
              styles.detailHeader
            }
          >
            <TouchableOpacity
              onPress={() =>
                setScreen(
                  'details',
                )
              }
              style={
                styles.backButton
              }
            >
              <Text
                style={styles.backText}
              >
                ‹
              </Text>
            </TouchableOpacity>

            <View
              style={
                styles.serviceHeaderCenter
              }
            >
              <Text
                style={
                  styles.detailHeaderTitle
                }
              >
                Select Services
              </Text>

              <Text
                style={
                  styles.serviceSalonName
                }
                numberOfLines={1}
              >
                {selectedSalon?.name}
              </Text>
            </View>

            <View
              style={
                styles.headerSpace
              }
            />
          </View>

          {servicesLoading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="large"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading services...
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={services}
                keyExtractor={(item) =>
                  item.id
                }
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={[
                  styles.serviceList,
                  {
                    paddingBottom:
                      selectedService ? 190 : 30,
                  },
                ]}
                ListEmptyComponent={
                  <View
                    style={
                      styles.emptyContainer
                    }
                  >
                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      No services available
                    </Text>
                  </View>
                }
                renderItem={({
                  item,
                }) => {
                  const selected =
                    selectedService?.id === item.id;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.serviceCard,
                        selected &&
                          styles.selectedServiceCard,
                      ]}
                      onPress={() =>
                        selectService(item)
                      }
                      activeOpacity={0.8}
                    >
                      <View
                        style={
                          styles.serviceTopRow
                        }
                      >
                        <View
                          style={
                            styles.serviceInfo
                          }
                        >
                          <Text
                            style={
                              styles.serviceName
                            }
                          >
                            {item.name}
                          </Text>

                          {item.description && (
                            <Text
                              style={
                                styles.serviceDescription
                              }
                              numberOfLines={
                                2
                              }
                            >
                              {
                                item.description
                              }
                            </Text>
                          )}

                          <View
                            style={
                              styles.serviceMeta
                            }
                          >
                            <Text
                              style={
                                styles.priceText
                              }
                            >
                              ₹
                              {Number(
                                item.price ||
                                  0,
                              ).toFixed(
                                2,
                              )}
                            </Text>

                            <Text
                              style={
                                styles.durationText
                              }
                            >
                              ⏱{' '}
                              {
                                item.durationMinutes ??
                                0
                              }{' '}
                              mins
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.checkbox,
                            selected &&
                              styles.checkboxSelected,
                          ]}
                        >
                          {selected && (
                            <Text
                              style={
                                styles.checkText
                              }
                            >
                              ✓
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />

              {selectedService && (
                <View style={styles.bottomSummary}>
                  <View style={styles.summaryRow}>
                    <View>
                      <Text style={styles.selectedCount}>
                        {selectedService.name}
                      </Text>
                      <Text style={styles.totalDuration}>
                        ⏱ {totalDuration} mins
                      </Text>
                    </View>

                    <View style={styles.totalPriceContainer}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalPrice}>
                        ₹{totalPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={continueToStaff}
                  >
                    <Text style={styles.continueButtonText}>
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // STAFF SELECTION
  // ====================================================

  if (
    screen === 'staff'
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.page}>
          {/* HEADER */}

          <View
            style={
              styles.detailHeader
            }
          >
            <TouchableOpacity
              onPress={() =>
                setScreen(
                  'services',
                )
              }
              style={
                styles.backButton
              }
            >
              <Text
                style={styles.backText}
              >
                ‹
              </Text>
            </TouchableOpacity>

            <View
              style={
                styles.serviceHeaderCenter
              }
            >
              <Text
                style={
                  styles.detailHeaderTitle
                }
              >
                Select Stylist
              </Text>

              <Text
                style={
                  styles.serviceSalonName
                }
                numberOfLines={1}
              >
                {selectedSalon?.name}
              </Text>
            </View>

            <View
              style={
                styles.headerSpace
              }
            />
          </View>

          {/* LOADING */}

          {staffLoading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="large"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading stylists...
              </Text>
            </View>
          ) : staff.length === 0 ? (
            /* EMPTY */

            <View
              style={
                styles.emptyContainer
              }
            >
              <Text
                style={
                  styles.emptyIcon
                }
              >
                👤
              </Text>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No stylists available
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                There are no active stylists
                for this salon.
              </Text>

              <TouchableOpacity
                style={
                  styles.retryButton
                }
                onPress={() => {
                  if (
                    selectedSalon
                  ) {
                    fetchStaff(
                      selectedSalon.id,
                    );
                  }
                }}
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* STAFF LIST */

            <>
              <FlatList
                data={staff}
                keyExtractor={(item) =>
                  item.id
                }
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: 150,
                }}
                renderItem={({
                  item,
                }) => {
                  const isSelected =
                    selectedStaff?.id ===
                    item.id;

                  const staffName =
                    item.name ||
                    item.user?.name ||
                    'Staff';

                  return (
                    <TouchableOpacity
                      style={[
                        styles.staffCard,
                        isSelected &&
                          styles.selectedStaffCard,
                      ]}
                      onPress={() =>
                        selectStaff(
                          item,
                        )
                      }
                      activeOpacity={0.8}
                    >
                      {/* IMAGE */}

                      {item.profileImage ? (
                        <Image
                          source={{
                            uri: item.profileImage,
                          }}
                          style={
                            styles.staffImage
                          }
                        />
                      ) : (
                        <View
                          style={
                            styles.staffPlaceholder
                          }
                        >
                          <Text
                            style={
                              styles.staffPlaceholderText
                            }
                          >
                            {staffName
                              .charAt(
                                0,
                              )
                              .toUpperCase()}
                          </Text>
                        </View>
                      )}

                      {/* INFO */}

                      <View
                        style={
                          styles.staffInfo
                        }
                      >
                        <Text
                          style={
                            styles.staffName
                          }
                        >
                          {staffName}
                        </Text>

                        {item.specialization ? (
                          <Text
                            style={
                              styles.staffSpecialization
                            }
                          >
                            {
                              item.specialization
                            }
                          </Text>
                        ) : null}

                        {item.experienceYears !==
                          undefined && (
                          <Text
                            style={
                              styles.staffExperience
                            }
                          >
                            {
                              item.experienceYears
                            }{' '}
                            year
                            {item.experienceYears !==
                            1
                              ? 's'
                              : ''}{' '}
                            experience
                          </Text>
                        )}

                        {item.bio ? (
                          <Text
                            style={
                              styles.staffBio
                            }
                            numberOfLines={
                              2
                            }
                          >
                            {item.bio}
                          </Text>
                        ) : null}
                      </View>

                      {/* CHECK */}

                      <View
                        style={[
                          styles.checkbox,
                          isSelected &&
                            styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Text
                            style={
                              styles.checkText
                            }
                          >
                            ✓
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />

              {/* BOTTOM */}

              {selectedStaff && (
                <View
                  style={
                    styles.bottomSummary
                  }
                >
                  <View
                    style={
                      styles.summaryRow
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.selectedStaffText
                        }
                      >
                        Selected Stylist
                      </Text>

                      <Text
                        style={
                          styles.selectedStaffName
                        }
                      >
                        {
                          selectedStaff.name
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.totalPriceContainer
                      }
                    >
                      <Text
                        style={
                          styles.totalLabel
                        }
                      >
                        Total
                      </Text>

                      <Text
                        style={
                          styles.totalPrice
                        }
                      >
                        ₹
                        {totalPrice.toFixed(
                          2,
                        )}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={
                      styles.continueButton
                    }
                    onPress={
                      continueAfterStaff
                    }
                  >
                    <Text
                      style={
                        styles.continueButtonText
                      }
                    >
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // TIME SELECTION
  // ====================================================

  if (screen === 'myBookings') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.myBookingsHeader}>
          <TouchableOpacity
            onPress={() => setScreen('home')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.myBookingsTitle}>
            My Bookings
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.myBookingsContainer}
        >
          {myBookings.length === 0 ? (
            <View style={styles.emptyBookings}>
              <Text style={styles.emptyBookingsIcon}>
                📅
              </Text>

              <Text style={styles.emptyBookingsTitle}>
                No bookings yet
              </Text>

              <Text style={styles.emptyBookingsText}>
                Your appointments will appear here after booking.
              </Text>

              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => setScreen('home')}
              >
                <Text style={styles.bookNowButtonText}>
                  Book an Appointment
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            myBookings.map((booking) => (
              <View
                key={booking.id}
                style={styles.myBookingCard}
              >
                <View style={styles.myBookingTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.myBookingSalon}>
                      {booking.salonName}
                    </Text>

                    <Text style={styles.myBookingService}>
                      {booking.serviceName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.bookingStatusBadge,
                      booking.status === 'CANCELLED' &&
                        styles.bookingCancelledBadge,
                    ]}
                  >
                    <Text style={styles.bookingStatusText}>
                      {booking.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.myBookingDetailRow}>
                  <Text style={styles.myBookingLabel}>Stylist</Text>
                  <Text style={styles.myBookingValue}>
                    {booking.staffName}
                  </Text>
                </View>

                <View style={styles.myBookingDetailRow}>
                  <Text style={styles.myBookingLabel}>Date</Text>
                  <Text style={styles.myBookingValue}>
                    {booking.date || '-'}
                  </Text>
                </View>

                <View style={styles.myBookingDetailRow}>
                  <Text style={styles.myBookingLabel}>Time</Text>
                  <Text style={styles.myBookingValue}>
                    {booking.time || '-'}
                  </Text>
                </View>

                <View style={styles.myBookingDetailRow}>
                  <Text style={styles.myBookingLabel}>Status</Text>
                  <Text
                    style={[
                      styles.myBookingValue,
                      booking.status === 'CANCELLED' &&
                        styles.myBookingCancelledValue,
                    ]}
                  >
                    {booking.status || 'PENDING'}
                  </Text>
                </View>

                <View style={styles.myBookingDetailRow}>
                  <Text style={styles.myBookingLabel}>Duration</Text>
                  <Text style={styles.myBookingValue}>
                    {booking.duration} mins
                  </Text>
                </View>

                <View style={styles.myBookingDetailRow}>
                  <Text style={styles.myBookingLabel}>Total Amount</Text>
                  <Text style={styles.myBookingPrice}>
                    ₹{Number(booking.price).toFixed(2)}
                  </Text>
                </View>

                {booking.status !== 'CANCELLED' && (
                  <TouchableOpacity
                    style={styles.cancelBookingButton}
                    onPress={() => cancelBooking(booking.id)}
                  >
                    <Text style={styles.cancelBookingText}>
                      Cancel Booking
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Booking Successful!</Text>
          <Text style={styles.successSubtitle}>Your appointment has been confirmed.</Text>

          <View style={styles.bookingCard}>
            <Text style={styles.bookingCardTitle}>Full Booking Details</Text>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Salon</Text><Text style={styles.detailValue}>{selectedSalon?.name || '-'}</Text></View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Service</Text><Text style={styles.detailValue}>{selectedService?.name || '-'}</Text></View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Stylist</Text><Text style={styles.detailValue}>{selectedStaff?.name || '-'}</Text></View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{selectedDate || '-'}</Text></View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Time</Text><Text style={styles.detailValue}>{selectedTime || '-'}</Text></View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Duration</Text><Text style={styles.detailValue}>{totalDuration} mins</Text></View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Total Amount</Text><Text style={styles.detailPrice}>₹{totalPrice.toFixed(2)}</Text></View>
          </View>

          <TouchableOpacity style={styles.successButton} onPress={() => setScreen('home')}>
            <Text style={styles.successButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'time') {
    const timeSlots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '12:00 PM',
      '12:30 PM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
      '05:00 PM',
      '05:30 PM',
      '06:00 PM',
      '06:30 PM',
    ];

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.page}>
          <View style={styles.serviceHeader}>
            <TouchableOpacity
              onPress={() => setScreen('date')}
              style={styles.backButton}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.serviceHeaderCenter}>
              <Text style={styles.detailHeaderTitle}>
                Select Time
              </Text>
              <Text style={styles.serviceSalonName}>
                {selectedSalon?.name}
              </Text>
            </View>

            <View style={styles.headerSpace} />
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeTitle}>
              Choose appointment time
            </Text>

            <View style={styles.selectedInfoCard}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {selectedDate}
              </Text>

              <Text style={styles.infoLabel}>Stylist</Text>
              <Text style={styles.infoValue}>
                {selectedStaff?.name}
              </Text>

              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>
                {selectedService?.name}
              </Text>
            </View>

            <Text style={styles.timeLabel}>
              Available Time Slots
            </Text>

            <View style={styles.timeOptions}>
              {timeSlots.map((time) => {
                const selected = selectedTime === time;

                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeCard,
                      selected && styles.selectedTimeCard,
                    ]}
                    onPress={() => selectTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selected && styles.selectedTimeText,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedTime && (
            <View style={styles.bottomSummary}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.selectedStaffText}>
                    Selected Time
                  </Text>
                  <Text style={styles.selectedStaffName}>
                    {selectedTime}
                  </Text>
                </View>

                <View style={styles.totalPriceContainer}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalPrice}>
                    ₹{totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={continueAfterTime}
              >
                <Text style={styles.continueButtonText}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // DATE SELECTION
  // ====================================================

  if (
    screen === 'date'
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.page}>
          <View
            style={
              styles.detailHeader
            }
          >
            <TouchableOpacity
              onPress={() =>
                setScreen('staff')
              }
              style={
                styles.backButton
              }
            >
              <Text
                style={styles.backText}
              >
                ‹
              </Text>
            </TouchableOpacity>

            <View
              style={
                styles.serviceHeaderCenter
              }
            >
              <Text
                style={
                  styles.detailHeaderTitle
                }
              >
                Select Date
              </Text>

              <Text
                style={
                  styles.serviceSalonName
                }
              >
                {selectedSalon?.name}
              </Text>
            </View>

            <View
              style={
                styles.headerSpace
              }
            />
          </View>

          <View
            style={
              styles.dateContainer
            }
          >
            <Text
              style={
                styles.dateTitle
              }
            >
              Choose appointment date
            </Text>

            {/* BOOKING SUMMARY */}

            <View
              style={
                styles.selectedInfoCard
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                Stylist
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {selectedStaff?.name}
              </Text>

              <Text
                style={
                  styles.infoLabel
                }
              >
                Services
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {selectedService?.name || 'No service selected'}
              </Text>

              <Text
                style={
                  styles.infoLabel
                }
              >
                Duration
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {totalDuration}{' '}
                mins
              </Text>

              <Text
                style={
                  styles.infoLabel
                }
              >
                Total
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                ₹
                {totalPrice.toFixed(
                  2,
                )}
              </Text>
            </View>

            <Text
              style={
                styles.dateLabel
              }
            >
              Select Date
            </Text>

            <View
              style={
                styles.dateOptions
              }
            >
              {Array.from(
                { length: 7 },
                (_, index) => {
                  const date =
                    new Date();

                  date.setDate(
                    date.getDate() +
                      index,
                  );

                  const year =
                    date.getFullYear();

                  const month =
                    String(
                      date.getMonth() +
                        1,
                    ).padStart(
                      2,
                      '0',
                    );

                  const day =
                    String(
                      date.getDate(),
                    ).padStart(
                      2,
                      '0',
                    );

                  const dateString =
                    `${year}-${month}-${day}`;

                  const dayName =
                    date.toLocaleDateString(
                      'en-US',
                      {
                        weekday:
                          'short',
                      },
                    );

                  const dayNumber =
                    date.getDate();

                  const selected =
                    selectedDate ===
                    dateString;

                  return (
                    <TouchableOpacity
                      key={
                        dateString
                      }
                      style={[
                        styles.dateCard,
                        selected &&
                          styles.selectedDateCard,
                      ]}
                      onPress={() =>
                        selectDate(
                          dateString,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.dayName,
                          selected &&
                            styles.selectedDateText,
                        ]}
                      >
                        {dayName}
                      </Text>

                      <Text
                        style={[
                          styles.dayNumber,
                          selected &&
                            styles.selectedDateText,
                        ]}
                      >
                        {
                          dayNumber
                        }
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          </View>

          {/* DATE CONTINUE */}

          {selectedDate && (
            <View
              style={
                styles.bottomSummary
              }
            >
              <View
                style={
                  styles.summaryRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.selectedStaffText
                    }
                  >
                    Selected Date
                  </Text>

                  <Text
                    style={
                      styles.selectedStaffName
                    }
                  >
                    {selectedDate}
                  </Text>
                </View>

                <View
                  style={
                    styles.totalPriceContainer
                  }
                >
                  <Text
                    style={
                      styles.totalLabel
                    }
                  >
                    Total
                  </Text>

                  <Text
                    style={
                      styles.totalPrice
                    }
                  >
                    ₹
                    {totalPrice.toFixed(
                      2,
                    )}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={
                  styles.continueButton
                }
                onPress={
                  continueAfterDate
                }
              >
                <Text
                  style={
                    styles.continueButtonText
                  }
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  // GENERAL
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:
      Platform.OS === 'android'
        ? 8
        : 0,
  },

  page: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // LOGIN
  registerContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },

  registerLoginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  registerLoginText: {
    fontSize: 14,
    color: '#777',
  },

  registerLoginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },

  loginContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignSelf: 'center',
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  logoText: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '700',
  },

  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111',
  },

  appSubtitle: {
    textAlign: 'center',
    color: '#777',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 36,
  },

  form: {
    width: '100%',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fafafa',
  },

  passwordContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111',
  },

  eyeButton: {
    width: 52,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  eyeText: {
    fontSize: 21,
  },

  primaryButton: {
    height: 52,
    backgroundColor: '#111',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 9,
  },

  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  // SEARCH
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },

  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#111',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  // SALON
  salonList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  salonCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 18,
  },

  salonImage: {
    width: '100%',
    height: 190,
  },

  imagePlaceholder: {
    width: '100%',
    height: 190,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    color: '#888',
    fontSize: 14,
  },

  salonContent: {
    padding: 16,
  },

  salonName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111',
  },

  rating: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },

  salonDescription: {
    color: '#777',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  viewButton: {
    height: 44,
    backgroundColor: '#111',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },

  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // DETAIL HEADER
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    marginTop: 4,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },

  backText: {
    fontSize: 32,
    lineHeight: 35,
    color: '#111',
  },

  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },

  headerSpace: {
    width: 42,
  },

  // DETAILS
  detailImage: {
    width: '100%',
    height: 250,
  },

  detailContent: {
    padding: 20,
  },

  detailName: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111',
  },

  detailRating: {
    fontSize: 15,
    color: '#555',
    marginTop: 8,
  },

  detailDescription: {
    fontSize: 15,
    lineHeight: 23,
    color: '#666',
    marginTop: 18,
  },

  contactText: {
    fontSize: 14,
    color: '#555',
    marginTop: 12,
  },

  // SERVICE HEADER
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },

  serviceHeaderCenter: {
    alignItems: 'center',
    maxWidth: '70%',
  },

  serviceSalonName: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  // SERVICES
  serviceList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  serviceCard: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  selectedServiceCard: {
    borderWidth: 2,
    borderColor: '#111',
    backgroundColor: '#fafafa',
  },

  serviceTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  serviceInfo: {
    flex: 1,
    paddingRight: 12,
  },

  serviceName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
  },

  serviceDescription: {
    fontSize: 13,
    color: '#777',
    lineHeight: 18,
    marginTop: 6,
  },

  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },

  durationText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 14,
  },

  // CHECKBOX
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  checkboxSelected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },

  checkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  // STAFF
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  selectedStaffCard: {
    borderWidth: 2,
    borderColor: '#111',
    backgroundColor: '#fafafa',
  },

  staffImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },

  staffPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  staffPlaceholderText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#555',
  },

  staffInfo: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },

  staffName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
  },

  staffSpecialization: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },

  staffExperience: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },

  staffBio: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    lineHeight: 17,
  },

  // EMPTY
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 80,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },

  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#777',
    fontSize: 14,
  },

  // BOTTOM
  bottomSummary: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  selectedCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },

  totalDuration: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },

  totalPriceContainer: {
    alignItems: 'flex-end',
  },

  totalLabel: {
    fontSize: 12,
    color: '#777',
  },

  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
    marginTop: 2,
  },

  selectedStaffText: {
    fontSize: 12,
    color: '#777',
  },

  selectedStaffName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginTop: 3,
  },

  continueButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  // TIME
  successContainer: { flex: 1, paddingHorizontal: 20, alignItems: 'center', paddingTop: 40 },
  successIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F7EE', marginBottom: 18 },
  successIconText: { fontSize: 42, fontWeight: '800', color: '#239653' },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#222', textAlign: 'center' },
  successSubtitle: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  bookingCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E8E8E8' },
  bookingCardTitle: { fontSize: 19, fontWeight: '800', color: '#222', marginBottom: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  detailLabel: { fontSize: 14, color: '#777', flex: 1 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#222', textAlign: 'right', flex: 1.5 },
  detailPrice: { fontSize: 17, fontWeight: '800', color: '#222', textAlign: 'right' },
  detailDivider: { height: 1, backgroundColor: '#EFEFEF' },
  successButton: { width: '100%', marginTop: 24, paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#222' },
  successButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  timeContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 120,
  },

  timeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 18,
  },

  timeLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },

  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  timeCard: {
    width: '31%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
  },

  selectedTimeCard: {
    backgroundColor: '#111',
    borderColor: '#111',
  },

  timeText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '700',
  },

  selectedTimeText: {
    color: '#fff',
  },

  // DATE
  dateContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  dateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 18,
  },

  selectedInfoCard: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 15,
    padding: 16,
    backgroundColor: '#fafafa',
    marginBottom: 24,
  },

  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginTop: 2,
  },

  dateLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },

  dateOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateCard: {
    width: 43,
    height: 72,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  selectedDateCard: {
    backgroundColor: '#111',
    borderColor: '#111',
  },

  dayName: {
    fontSize: 11,
    color: '#777',
    fontWeight: '600',
  },

  dayNumber: {
    fontSize: 19,
    color: '#111',
    fontWeight: '800',
    marginTop: 5,
  },

  selectedDateText: {
    color: '#fff',
  },

  myBookingsHomeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  myBookingsHomeText: {
    flex: 1,
  },

  myBookingsHomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },

  myBookingsHomeSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#777',
  },

  myBookingsHomeArrow: {
    fontSize: 30,
    color: '#555',
    marginLeft: 10,
  },

  myBookingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  myBookingsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },

  myBookingsContainer: {
    padding: 16,
    paddingBottom: 30,
  },

  emptyBookings: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  emptyBookingsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyBookingsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },

  emptyBookingsText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  bookNowButton: {
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookNowButtonText: {
    color: '#fff',
    fontWeight: '800',
  },

  myBookingCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  myBookingTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  myBookingSalon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },

  myBookingService: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  bookingStatusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
    marginLeft: 8,
  },

  bookingCancelledBadge: {
    backgroundColor: '#eeeeee',
  },

  bookingStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#333',
  },

  myBookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  myBookingLabel: {
    fontSize: 13,
    color: '#777',
  },

  myBookingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    maxWidth: '65%',
    textAlign: 'right',
  },

  myBookingPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },

  myBookingCancelledValue: {
    color: '#d33',
    fontWeight: '800',
  },

  cancelBookingButton: {
    marginTop: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d33',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelBookingText: {
    color: '#d33',
    fontSize: 14,
    fontWeight: '800',
  },

});