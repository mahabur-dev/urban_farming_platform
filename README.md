# Urban Farming Platform - Backend API

A RESTful backend API for an interactive urban farming platform built with **Express**, **PostgreSQL**, and **Prisma ORM**. The platform supports multi-role access (Admin, Vendor, Customer), produce listings, rental spaces, community posts, order management, and sustainability certifications.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Modules](#api-modules)
- [Authentication](#authentication)
- [Scripts](#scripts)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | PostgreSQL 18 |
| ORM | Prisma 6 |
| Authentication | JWT (Access + Refresh Tokens) |
| File Uploads | Multer + Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Real-time | Socket.IO |
| Validation | Zod |
| Rate Limiting | express-rate-limit |

---

## Project Structure

```
urban_farming_platform/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   └── app/
│       ├── config/
│       ├── helper/
│       ├── middlewares/
│       └── modules/
│           ├── auth/
│           │   ├── auth.controller.ts
│           │   ├── auth.service.ts
│           │   └── auth.routes.ts
│           ├── user/
│           │   ├── user.controller.ts
│           │   ├── user.service.ts
│           │   ├── user.routes.ts
│           │   └── user.constant.ts
│           ├── vendor/
│           ├── produce/
│           ├── rentalSpace/
│           ├── order/
│           ├── communityPost/
│           └── sustainability/
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed before running the project:

- Node.js >= 18
- PostgreSQL 18
- npm

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/urban_farming_platform.git
cd urban_farming_platform
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Fill in your values in the `.env` file (see [Environment Variables](#environment-variables) section below).

**4. Generate Prisma client**

```bash
npx prisma generate
```

**5. Run database migrations**

```bash
npx prisma migrate dev --name init
```

**6. Seed the database**

```bash
npx prisma db seed
```

**7. Start the development server**

```bash
npm run dev
```

The server will be running at `http://localhost:5000`

---

## Environment Variables

Create a `.env` file in the root of the project and add the following:

```env
# Server
NODE_ENV=development
PORT=5000

# PostgreSQL (Prisma)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5433/urban_farming_platform"

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRES=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES=90d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=10

# Frontend
FRONTEND_URL=http://localhost:3000
```

> **Note:** For Gmail, use an App Password instead of your regular password. Go to Google Account > Security > 2-Step Verification > App Passwords to generate one.

---

## Database Setup

### Step 1 — Create the database

Open psql or pgAdmin and run:

```sql
CREATE DATABASE urban_farming_platform;
```

### Step 2 — Run all commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed

# Open visual database browser (optional)
npx prisma studio
```

Prisma Studio will open at `http://localhost:5555`

### Default Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@urbanfarm.com | Password@123 |
| Customer | customer@urbanfarm.com | Password@123 |
| Vendor 1 | vendor1@urbanfarm.com | Password@123 |
| Vendor 2 | vendor2@urbanfarm.com | Password@123 |
| Vendor 3 to 10 | vendor3 to vendor10@urbanfarm.com | Password@123 |

---

## API Modules

All routes are prefixed with `/api/v1`

Base URL: `http://localhost:5000/api/v1`

---

### Auth — `/api/v1/auth`

> Rate limited: 10 requests per 15 minutes on sensitive endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive tokens |
| POST | `/auth/refresh-token` | Public | Get new access token |
| POST | `/auth/forgot-password` | Public | Send password reset email |
| POST | `/auth/verify-email` | Public | Verify email address |
| POST | `/auth/reset-password` | Public | Reset password with token |
| POST | `/auth/logout` | Public | Logout user |
| POST | `/auth/change-password` | Admin, Vendor, Customer | Change current password |

---

### Users — `/api/v1/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/users/create-user` | Admin | Create a new user |
| GET | `/users/profile` | Admin, Vendor, Customer | Get own profile |
| PUT | `/users/profile` | Admin, Vendor, Customer | Update own profile |
| GET | `/users/all` | Admin | Get all users |
| GET | `/users/:id` | Admin | Get user by ID |
| PUT | `/users/:id` | Admin | Update user by ID |
| DELETE | `/users/:id` | Admin | Delete user by ID |

---

### Vendors — `/api/v1/vendors`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/vendors/profile` | Vendor | Create vendor profile |
| GET | `/vendors/profile/me` | Vendor | Get own vendor profile |
| PUT | `/vendors/profile/me` | Vendor | Update own vendor profile |
| GET | `/vendors/all` | Admin | Get all vendors |
| GET | `/vendors/:id` | Admin | Get vendor by ID |
| PATCH | `/vendors/:id/status` | Admin | Update certification status |

---

### Produce — `/api/v1/produce`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/produce` | Vendor | Create a produce listing |
| GET | `/produce` | Public | Get all produce |
| GET | `/produce/my` | Vendor | Get own produce listings |
| GET | `/produce/:id` | Public | Get produce by ID |
| PUT | `/produce/:id` | Vendor | Update produce listing |
| DELETE | `/produce/:id` | Vendor | Delete produce listing |
| PATCH | `/produce/:id/status` | Admin | Approve or reject produce |

---

### Rental Spaces — `/api/v1/rental-spaces`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/rental-spaces` | Vendor | Create a rental space |
| GET | `/rental-spaces` | Public | Get all rental spaces |
| GET | `/rental-spaces/my` | Vendor | Get own rental spaces |
| GET | `/rental-spaces/:id` | Public | Get rental space by ID |
| PUT | `/rental-spaces/:id` | Vendor | Update rental space |
| DELETE | `/rental-spaces/:id` | Vendor | Delete rental space |

---

### Orders — `/api/v1/orders`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/orders` | Customer | Place a new order |
| GET | `/orders/my` | Customer | Get own orders |
| GET | `/orders/all` | Admin, Vendor | Get all orders |
| GET | `/orders/:id` | Admin, Vendor, Customer | Get order by ID |
| PATCH | `/orders/:id/status` | Admin, Vendor | Update order status |

---

### Community Posts — `/api/v1/community`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/community` | Admin, Vendor, Customer | Create a community post |
| GET | `/community` | Public | Get all community posts |
| GET | `/community/:id` | Public | Get post by ID |
| PUT | `/community/:id` | Admin, Vendor, Customer | Update a post |
| DELETE | `/community/:id` | Admin, Vendor, Customer | Delete a post |

---

### Sustainability — `/api/v1/sustainability`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/sustainability` | Vendor | Submit a sustainability certificate |
| GET | `/sustainability/my` | Vendor | Get own certificates |
| GET | `/sustainability/all` | Admin | Get all certificates |
| PATCH | `/sustainability/:id/status` | Admin | Approve or reject certificate |

---

## Authentication

This API uses **JWT-based authentication** with two tokens:

- **Access Token** — short-lived (`7d`), included in the `Authorization` header
- **Refresh Token** — long-lived (`90d`), used to get a new access token

### How to send authenticated requests

Include the access token in every protected request header:

```
Authorization: Bearer <your_access_token>
```

### User Roles

| Role | Description |
|---|---|
| `admin` | Full access to all resources and user management |
| `vendor` | Manage own produce, rental spaces, and sustainability certificates |
| `customer` | Browse listings, place orders, and participate in community |

---

## Scripts

| Script | Command | Description |
|---|---|---|
| Start dev server | `npm run dev` | Run with ts-node-dev and hot reload |
| Build | `npm run build` | Compile TypeScript to JavaScript |
| Start production | `npm run start` | Run compiled dist/server.js |
| Build and start | `npm run build-and-start` | Build then start in one command |
| Lint | `npm run lint` | Check for lint errors |
| Lint fix | `npm run lint:fix` | Auto-fix lint errors |
| Format | `npm run prettier:fix` | Format source files with Prettier |
| Generate client | `npm run db:generate` | Generate Prisma client from schema |
| Migrate | `npm run db:migrate` | Run Prisma database migrations |
| Push schema | `npm run db:push` | Push schema changes without migration file |
| Seed database | `npm run db:seed` | Seed the database with demo data |
| Prisma Studio | `npm run db:studio` | Open visual database browser at port 5555 |

---

## License

This project is licensed under the **ISC License**.
