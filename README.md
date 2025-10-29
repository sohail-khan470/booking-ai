# Booking Agent Backend

A comprehensive Node.js backend application for a salon booking system that integrates with Vapi AI for automated voice-based appointment scheduling. The system provides RESTful APIs for managing customers, staff, services, appointments, and time slots, with real-time AI-powered phone call handling.

## 🚀 Features

### Core Functionality

- **Appointment Management**: Full CRUD operations for salon appointments
- **Customer Management**: Customer profiles with contact information
- **Staff Management**: Staff scheduling and availability tracking
- **Service Catalog**: Manage salon services with pricing and duration
- **Time Slot Management**: Automated slot creation and booking system
- **Call Logging**: Track all Vapi AI interactions and call outcomes

### AI Integration

- **Vapi AI Integration**: Real-time voice conversations for appointment booking
- **Custom Functions**: Pre-built functions for booking, slot checking, and service queries
- **Webhook Handling**: Automatic processing of call events and function executions
- **Intelligent Routing**: AI-powered customer service and appointment scheduling

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js with Express.js framework
- **Database**: MySQL with Prisma ORM
- **AI Integration**: Vapi AI for voice conversations
- **Authentication**: Environment-based API key management
- **Logging**: Morgan for HTTP request logging

### Project Structure

```
backend/
├── controllers/                # Request handlers
│   ├── appointment-controller.js
│   ├── customer-controller.js
│   ├── service-catalog-controller.js
│   ├── slot-controller.js
│   ├── staff-controller.js
│   └── vapi-controller.js
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── routes/                     # API route definitions
│   ├── appointment-routes.js
│   ├── customer-routes.js
│   ├── service-catalog-routes.js
│   ├── slot-routes.js
│   ├── staff-routes.js
│   └── vapi-routes.js
├── services/                   # Business logic layer
│   ├── appointment-service.js
│   ├── customer-service.js
│   ├── service-catelog.js
│   ├── slot-service.js
│   ├── staff-service.js
│   └── vapi-service.js
├── index.js                    # Application entry point
├── seed.js                     # Database seeding script
├── registerVapiFunctions.js    # Vapi AI function registration
└── package.json
```

## 📊 Database Schema

### Core Entities

#### Customer

- `customerId`: Primary key
- `name`: Customer name
- `phoneNumber`: Unique contact number
- `email`: Unique email address
- `appointments`: Related appointments

#### Staff

- `staffId`: Primary key
- `name`: Staff member name
- `role`: Job title/role
- `schedules`: Weekly availability
- `appointments`: Assigned appointments
- `slots`: Available time slots

#### Service

- `serviceId`: Primary key
- `serviceName`: Service name
- `description`: Service details
- `duration`: Service duration in minutes
- `price`: Service cost
- `appointments`: Related bookings

#### Appointment

- `appointmentId`: Primary key
- `customerId`: Foreign key to Customer
- `serviceId`: Foreign key to Service
- `staffId`: Foreign key to Staff
- `appointmentDate`: Scheduled date/time
- `status`: PENDING | CONFIRMED | CANCELLED | COMPLETED
- `createdAt`/`updatedAt`: Timestamps

#### Slot

- `slotId`: Primary key
- `staffId`: Foreign key to Staff
- `date`: Slot date
- `startTime`/`endTime`: Time range
- `isBooked`: Availability status

#### CallLog

- `callLogId`: Primary key
- `callId`: Vapi call identifier
- `phoneNumber`: Customer phone number
- `transcript`: Call conversation text
- `status`: Call outcome
- `appointmentId`: Linked appointment (optional)

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- Vapi AI account and API credentials

### Installation Steps

1. **Clone and Install Dependencies**

   ```bash
   git clone <repository-url>
   cd backend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/booking_agent"
   VAPI_API_KEY="your-vapi-api-key"
   VAPI_ASSISTANT_ID="your-vapi-assistant-id"
   PORT=3100
   ```

3. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # Seed the database with sample data
   npm run seed
   ```

4. **Vapi AI Configuration**

   ```bash
   # Register custom functions with Vapi AI
   node registerVapiFunctions.js
   ```

5. **Start the Application**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Base URL: `http://localhost:3100/api`

### Appointments (`/appointments`)

- `GET /` - Get all appointments
- `POST /` - Create new appointment
- `GET /:id` - Get appointment by ID
- `PUT /:id` - Update appointment
- `DELETE /:id` - Delete appointment
- `PATCH /:id/status` - Update appointment status
- `GET /customer/:customerId` - Get customer's appointments
- `GET /staff/:staffId` - Get staff's appointments

### Customers (`/customers`)

- `GET /` - Get all customers
- `POST /` - Create new customer
- `GET /:id` - Get customer by ID
- `PUT /:id` - Update customer
- `DELETE /:id` - Delete customer
- `GET /search?email=...&phoneNumber=...` - Find customer by email/phone

### Services (`/services`)

- `GET /` - Get all services
- `POST /` - Create new service
- `GET /:id` - Get service by ID
- `PUT /:id` - Update service
- `DELETE /:id` - Delete service
- `GET /duration?minDuration=...&maxDuration=...` - Filter by duration

### Staff (`/staff`)

- `GET /` - Get all staff members
- `POST /` - Create new staff member
- `GET /:id` - Get staff member by ID
- `PUT /:id` - Update staff member
- `DELETE /:id` - Delete staff member
- `POST /:id/schedules` - Add staff schedule
- `GET /:id/schedules` - Get staff schedules

### Slots (`/slots`)

- `GET /` - Get all slots
- `POST /` - Create new slot
- `GET /:id` - Get slot by ID
- `PUT /:id` - Update slot
- `DELETE /:id` - Delete slot
- `GET /available` - Get available slots
- `GET /staff/:staffId` - Get staff's slots
- `PATCH /:id/book` - Book a slot
- `PATCH /:id/free` - Free a slot

### Vapi Integration (`/vapi`)

- `POST /webhook` - Vapi webhook handler
- `POST /calls` - Initiate outbound call
- `GET /calls/:callId` - Get call status
- `GET /calls/history/:phoneNumber` - Get call history
- `GET /services` - Get services (for AI)
- `GET /staff` - Get staff (for AI)

## 🤖 Vapi AI Integration

### Custom Functions

The system includes pre-built functions that Vapi AI can execute during conversations:

#### `bookAppointment`

Books a new appointment with validation for availability and conflicts.

- **Parameters**: `name`, `date`, `service`, `staffId`
- **Returns**: Success confirmation with appointment details

#### `getAvailableSlots`

Retrieves open time slots for scheduling.

- **Parameters**: `date` (required), `staffId` (optional)
- **Returns**: List of available time slots with staff information

#### `getServices`

Provides the complete service catalog.

- **Parameters**: None
- **Returns**: All services with pricing and duration

#### `getStaff`

Lists all available staff members.

- **Parameters**: None
- **Returns**: Staff details with roles

### Webhook Events

The system handles various Vapi webhook events:

- `function-call`: Executes custom functions during conversations
- `conversation-update`: Processes completed calls
- `transcript`: Handles real-time transcription (future use)

### Function Registration
