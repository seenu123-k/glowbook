# GlowBook

GlowBook is a salon booking platform with a customer mobile application, customer web application, salon-owner dashboard, admin dashboard, and REST API.

## Project Structure

```text
glowbook/
├── apps-api/       # NestJS backend API
├── apps-web/       # React + TypeScript web application
└── apps-mobile/    # Expo React Native customer mobile app
```

## Main Features

### Customer
- Customer registration and login
- Browse active salons
- View salon details, services, and staff
- Select one service
- Select stylist
- Select date and time
- Create appointments
- View My Bookings
- Cancel bookings

### Salon Owner
- Salon management
- Salon services and staff management
- View salon appointments

### Admin
- Dashboard statistics
- User management
- Salon management
- Appointment management
- Review management
- User, salon, and review status updates

## Technology Stack

### Backend
- NestJS
- TypeScript
- Prisma ORM
- MySQL/MariaDB
- JWT authentication
- bcrypt password hashing

### Web
- React
- TypeScript
- React Router

### Mobile
- Expo
- React Native
- TypeScript
- Expo SDK 57

### Deployment
- Backend: Railway
- Web application: Vercel
- Mobile: Expo EAS Build

## Production URLs

### Backend API

`https://glowbook-production-b29b.up.railway.app`

### Web Application

`https://glowbook-mauve.vercel.app/`

## Local Setup

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd glowbook
```

### 2. Backend

```bash
cd apps-api
npm install
```

Configure the backend environment variables for the local MySQL/MariaDB database.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=glowbook
DATABASE_URL="mysql://root:@localhost:3306/glowbook"
```

Generate Prisma Client and start the backend:

```bash
npx prisma generate
npm run start:dev
```

### 3. Web Application

```bash
cd apps-web
npm install
npm run dev
```

### 4. Mobile Application

```bash
cd apps-mobile
npm install
npx expo start
```

For development with Expo Go, connect the phone and development computer to the same network and scan the QR code.

## Authentication

The backend uses JWT authentication.

Protected requests use:

```text
Authorization: Bearer <accessToken>
```

New registrations create customer accounts with the `CUSTOMER` role and `ACTIVE` status.

## User Roles

- `CUSTOMER` — customer booking and booking management
- `SALON_OWNER` — salon management
- `SALON_MANAGER` — salon management role
- `STAFF` — staff/stylist role
- `ADMIN` — platform administration

## Mobile Booking Flow

```text
Register
   ↓
Login
   ↓
Discover Salon
   ↓
Salon Details
   ↓
Select Service
   ↓
Select Stylist
   ↓
Select Date
   ↓
Select Time
   ↓
Booking Successful
   ↓
My Bookings
```

The mobile customer flow allows selection of one service per appointment.

## Database

The project uses Prisma with MySQL/MariaDB.

The main entities include:

- User
- Salon
- Category
- Service
- Staff
- WorkingHour
- StaffLeave
- Appointment
- Review
- RefreshToken

## Key Technical Decisions

### Prisma 7 Driver Adapter

The backend uses Prisma with the MariaDB driver adapter (`@prisma/adapter-mariadb`) for database connectivity.

### Environment-based Database Configuration

Database configuration is separated from the Prisma schema and supplied through environment variables. This supports local development and Railway deployment without hard-coding database credentials.

### JWT Authentication and Role Authorization

JWT access tokens are used for authentication. Role-based guards protect administrative and salon-owner functionality.

### Customer-only Mobile Application

The mobile application focuses on the customer booking experience. Admin and salon-owner management functionality remains on the web application.

### Appointment Validation

The backend validates appointment date/time values and checks for overlapping appointments before creating a booking.

### Review Rating Calculation

Admin review approval updates the salon's rating and review count based on approved reviews.

## API Documentation

See the accompanying `GlowBook_API_Documentation.md` file for endpoint details, request examples, authentication, roles, and booking flow.

## Mobile Build

The Android application was built using Expo EAS Build.

Android application ID:

```text
com.seenuram.glowbook
```

The Android build uses an internal/preview distribution profile for an installable APK.

## Demo Credentials

Demo credentials should be supplied separately with the final project submission. Use only verified working credentials for each role.

## Important Notes

- Replace `<YOUR_REPOSITORY_URL>` with the final source-code repository URL before submission.
- Do not commit real database passwords, JWT secrets, or other sensitive environment variables to the repository.
- Configure production environment variables in the deployment platform.

## Project Deliverables

- Source code repository
- Live web application
- Live marketing website
- Android mobile application/build
- Admin dashboard
- API documentation
- README with setup instructions and technical decisions
- Demo credentials
