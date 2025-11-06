# Sepidar Backend - PWA Integration Service

A TypeScript/Node.js backend service that provides a REST API layer between Progressive Web Applications (PWA) and the Sepidar ERP system.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Security](#security)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **JWT Authentication** - Secure token-based authentication with device limiting
- **Sepidar Integration** - Complete integration with Sepidar ERP API
- **Data Synchronization** - Automated sync of items, customers, quotations, and invoices
- **Device Management** - Multi-device support with configurable limits
- **Activity Logging** - Comprehensive audit trail of user actions
- **Rate Limiting** - Protection against API abuse
- **Security Headers** - Helmet.js for enhanced security
- **Validation** - Schema-based validation using Zod
- **Error Handling** - Centralized error handling and logging

## 🔧 Prerequisites

- **Node.js** 18 or higher
- **MongoDB** 5.0 or higher
- **Sepidar ERP** instance with API access
- **npm** or **yarn** package manager

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration (see [Configuration](#configuration))

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Environment
NODE_ENV=development          # development | production | test

# Server
PORT=3000                     # API server port

# Database
MONGODB_URI=mongodb://localhost:27017/sepidar_pwa

# JWT Secret (IMPORTANT: Use a strong, random 32+ character string)
APP_JWT_SECRET=your-super-secret-key-min-32-chars

# Sepidar API
SEPIDAR_URL=http://localhost:7373/api

# Optional Settings
DEFAULT_GENERATION_VERSION=101
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=info                # debug | info | warn | error
```

### Generating Secure JWT Secret

Use one of these methods to generate a secure secret:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start with hot-reload enabled at `http://localhost:3000`.

### Production Mode

```bash
# Build the application
npm run build

# Start the server
npm start
```

### Using Docker (Optional)

```bash
docker-compose up
```

## 📚 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123",
  "tenantId": "tenant-id",
  "integrationId": 1234
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-id",
    "username": "user@example.com",
    "role": "customer"
  }
}
```

### Items

#### List Items
```http
GET /api/items?page=1&limit=20&q=search-term
Authorization: Bearer <token>
x-device-id: device-uuid

Response:
{
  "items": [...],
  "page": 1,
  "limit": 20,
  "total": 100
}
```

#### Sync Items from Sepidar
```http
POST /api/items/sync
Authorization: Bearer <token>
x-device-id: device-uuid

Response:
{
  "ok": true,
  "items": 150,
  "inventories": 300,
  "priceNotes": 450
}
```

### Customers

#### List Customers
```http
GET /api/customers?page=1&limit=20
Authorization: Bearer <token>
x-device-id: device-uuid
```

#### Sync Customers
```http
POST /api/customers/sync
Authorization: Bearer <token>
x-device-id: device-uuid
```

### Quotations

#### Create Quotation
```http
POST /api/quotations
Authorization: Bearer <token>
x-device-id: device-uuid
Content-Type: application/json

{
  "customerId": 123,
  "items": [
    {
      "itemId": 456,
      "quantity": 10,
      "price": 100
    }
  ]
}
```

### Invoices

#### Create Invoice from Quotation
```http
POST /api/invoices/based-on-quotation/:quotationId
Authorization: Bearer <token>
x-device-id: device-uuid
```

### Admin

#### Register Device
```http
POST /api/admin/devices/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "serial": "1234567890123456",
  "integrationId": 1234
}
```

#### Full Sync
```http
POST /api/admin/sync/full
Authorization: Bearer <token>
x-device-id: device-uuid
```

## 🏗️ Architecture

### Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/                # Configuration files
│   ├── db.ts             # Database connection
│   ├── env.ts            # Environment validation
│   └── logger.ts         # Logger configuration
├── controllers/           # Request handlers
├── middlewares/           # Express middlewares
│   ├── auth.ts           # Authentication
│   ├── validate.ts       # Request validation
│   ├── errorHandler.ts   # Error handling
│   ├── deviceLimit.ts    # Device limiting
│   ├── activityLogger.ts # Activity logging
│   └── rateLimit.ts      # Rate limiting
├── models/                # Mongoose models
├── routes/                # API routes
├── services/              # Business logic
│   ├── sepidarService.ts # Sepidar API client
│   └── syncService.ts    # Data synchronization
├── utils/                 # Utility functions
└── types/                 # TypeScript type definitions
```

### Key Components

- **SepidarService**: Handles all communication with Sepidar API, including device registration, authentication, and data retrieval
- **SyncService**: Manages data synchronization between Sepidar and local MongoDB
- **Auth Middleware**: JWT-based authentication with device tracking
- **Device Limiting**: Restricts number of devices per user

## 🔒 Security

### Implemented Security Measures

- **Helmet.js**: Security headers (XSS, clickjacking protection, etc.)
- **CORS**: Configurable origin restrictions
- **Rate Limiting**: 120 requests per minute per IP
- **JWT Authentication**: Secure token-based auth with 7-day expiry
- **Device Limiting**: Configurable max devices per user (default: 2)
- **Input Validation**: Zod schema validation on all endpoints
- **Error Sanitization**: Production mode hides internal errors
- **Activity Logging**: Audit trail of all user actions
- **MongoDB Injection Protection**: Mongoose query sanitization

### Security Notes

1. **MD5 Password Hashing**: The Sepidar API requires MD5 hashing for passwords. This is a limitation of the external API and applies only to Sepidar authentication. Internal user passwords (if implemented) should use bcrypt.

2. **Environment-Based CORS**: In production, CORS is restricted to specified origins only.

3. **JWT Secret**: Must be at least 32 characters. Use a cryptographically secure random string.

## 🛠️ Development

### Code Style

This project uses ESLint for code quality:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Building

```bash
npm run build
```

Output will be in the `dist/` directory.

### Database Indexes

The following indexes are created automatically:
- Items: `{ tenantId: 1, itemId: 1 }` (unique), `{ tenantId: 1, code: 1 }`
- Customers: `{ tenantId: 1, customerId: 1 }` (unique), `{ tenantId: 1, code: 1 }`
- Users: `{ tenantId: 1, username: 1 }` (unique)
- Devices: `{ tenantId: 1, integrationId: 1 }` (unique)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- `tests/auth.test.ts` - Authentication tests
- `tests/items.test.ts` - Items API tests

## 📦 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `APP_JWT_SECRET` (32+ characters)
- [ ] Configure `ALLOWED_ORIGINS` with your frontend URLs
- [ ] Set up MongoDB with authentication
- [ ] Enable MongoDB replication for high availability
- [ ] Configure log aggregation
- [ ] Set up monitoring (e.g., PM2, New Relic, Datadog)
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Enable HTTPS
- [ ] Set up automated backups
- [ ] Configure firewall rules

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server.js --name sepidar-backend

# Monitor
pm2 monit

# Logs
pm2 logs sepidar-backend

# Restart
pm2 restart sepidar-backend
```

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error

**Error**: `MongooseError: Operation 'users.findOne()' buffering timed out`

**Solution**: Ensure MongoDB is running and `MONGODB_URI` is correct.

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

#### JWT Secret Error

**Error**: `APP_JWT_SECRET must be at least 32 characters`

**Solution**: Generate a secure secret and add to `.env`:

```bash
openssl rand -base64 32
```

#### Sepidar API Connection Error

**Error**: `ECONNREFUSED` when calling Sepidar

**Solution**: 
1. Verify `SEPIDAR_URL` is correct
2. Check network connectivity to Sepidar server
3. Ensure device is registered (call `/api/admin/devices/register` first)

#### Device Limit Reached

**Error**: `Device limit reached`

**Solution**: Either:
1. Remove old devices from user's device list in MongoDB
2. Increase `maxDevices` for the user in MongoDB
3. Use an existing device ID

### Logging

Logs are written to:
- Console (stdout/stderr)
- MongoDB (ErrorLog collection for errors)
- MongoDB (ActivityLog collection for user actions)

Adjust log level in `.env`:
```env
LOG_LEVEL=debug  # Shows all logs including debug info
LOG_LEVEL=info   # Default, shows info, warn, and error
LOG_LEVEL=warn   # Shows only warnings and errors
LOG_LEVEL=error  # Shows only errors
```

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your contributing guidelines here]

## 📞 Support

[Your support contact information here]

---

**راه‌اندازی سریع (فارسی)**

1. نصب وابستگی‌ها: `npm install`
2. کپی فایل محیط: `cp .env.example .env`
3. ویرایش `.env` و تنظیم متغیرها
4. اجرا در حالت توسعه: `npm run dev`

نقاط کلیدی:
- احراز هویت: `/api/auth/login`
- آیتم‌ها: `/api/items` و `/api/items/sync`
- مشتری‌ها: `/api/customers` و `/api/customers/sync`
- پیش‌فاکتور: `POST /api/quotations`
- فاکتور: `/api/invoices`
- مدیریت: `/api/admin/devices/register` و `/api/admin/sync/full`
