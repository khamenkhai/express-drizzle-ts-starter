# Express TypeScript API

A production-ready Express.js API with TypeScript, Prisma ORM, PostgreSQL, JWT authentication, RBAC, email verification, password management, and modular architecture.

## Features

- **TypeScript** - Full type safety with strict mode
- **Modular Architecture** - Feature-based folder structure (Controller-Service-Route-Validation)
- **Authentication** - JWT-based auth with access + refresh tokens (DB-backed, revocable)
- **Email Verification** - Two-step registration with 6-digit code (15min expiry)
- **Password Management** - Forgot/reset password with token, change password for authenticated users
- **Authorization** - Permission-based RBAC (resource:action pattern)
- **Validation** - Request validation using Zod schemas
- **Error Handling** - Centralized error handling with custom error classes
- **Logging** - Winston logger with file + console transports
- **Security** - Helmet, CORS, rate limiting, bcrypt password hashing
- **Email** - Nodemailer integration with HTML email templates
- **Database** - Prisma ORM with PostgreSQL
- **Code Generation** - CLI script to scaffold new CRUD modules

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (local or remote)

## Installation

```bash
npm install
```

## Environment Setup

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
NODE_ENV=development
PORT=5002
API_VERSION=v1

DATABASE_URL=postgresql://khamenkhai@localhost:5432/express_db

JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

BCRYPT_ROUNDS=10

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=your-email@gmail.com

FRONTEND_URL=http://localhost:3000
```

### Gmail Setup (for Nodemailer)

1. Enable 2-Factor Authentication at https://myaccount.google.com/security
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password as `MAIL_PASS`

## Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Database
npm run db:migrate    # Run migrations
npm run db:push       # Push schema changes
npm run db:studio     # Open Prisma Studio
npm run db:generate   # Regenerate Prisma Client

# Seed database
npm run seed

# Generate a new CRUD module
npm run generate <resourceName>

# Lint
npm run lint
npm run lint:fix
```

## Project Structure

```
src/
├── config/
│   └── env.ts                    # Zod-validated environment config
├── db/
│   ├── index.ts                  # Prisma client instance
│   ├── seed/
│   │   └── seed.ts               # Database seed script
│   └── generated/                # Auto-generated Prisma client
├── modules/
│   ├── auth/                     # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.route.ts
│   │   └── auth.validation.ts
│   ├── users/                    # Users module
│   ├── roles/                    # Roles module (RBAC)
│   ├── permissions/              # Permissions module (RBAC)
│   └── posts/                    # Posts module (example)
├── scripts/
│   └── generate.ts               # CRUD module generator
├── shared/
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   ├── permissions.middleware.ts  # RBAC permission check
│   │   ├── validate.middleware.ts # Zod validation
│   │   ├── error.middleware.ts    # Centralized error handler
│   │   └── logger.middleware.ts   # Request logger
│   ├── services/
│   │   ├── mailer.ts             # Nodemailer transporter
│   │   └── emailTemplates.ts     # HTML email templates
│   ├── types/
│   │   ├── index.ts              # Shared types (ApiResponse, AuthRequest, etc.)
│   │   └── error.ts              # Custom error classes
│   └── utils/
│       ├── jwt.utils.ts          # JWT sign/verify
│       ├── password.utils.ts     # bcrypt hash/compare
│       ├── logger.ts             # Winston logger
│       └── asyncHandler.ts       # Async wrapper
├── app.ts                        # Express app factory
├── server.ts                     # Server entry point
└── routes.ts                     # Central route aggregator
```

## API Endpoints

### Response Format

All endpoints return a consistent format:

```json
// Success
{
  "status": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error
{
  "status": false,
  "message": "Error description"
}
```

### Health Check

```
GET  /api/v1/health
GET  /
```

### Authentication

```
POST  /api/v1/auth/register         # Step 1: Initiate registration (sends verification code)
POST  /api/v1/auth/verify-email     # Step 2: Verify email with 6-digit code
POST  /api/v1/auth/login            # Login (requires verified email)
POST  /api/v1/auth/refresh          # Refresh access token
GET   /api/v1/auth/profile          # Get current user profile (Protected)
POST  /api/v1/auth/logout           # Logout - revoke refresh token (Protected)
POST  /api/v1/auth/forgot-password  # Send password reset email
POST  /api/v1/auth/reset-password   # Reset password with token
POST  /api/v1/auth/change-password  # Change password (Protected)
```

### Users

```
GET    /api/v1/users                # Get all users (Admin)
GET    /api/v1/users/:id            # Get user by ID (Admin)
PATCH  /api/v1/users/me             # Update current user (Protected)
PATCH  /api/v1/users/:id/role       # Update user role (Admin)
DELETE /api/v1/users/:id            # Delete user (Admin)
```

### Roles

```
GET    /api/v1/roles                # Get all roles (Protected)
GET    /api/v1/roles/:id            # Get role by ID (Protected)
POST   /api/v1/roles                # Create role (Admin)
PATCH  /api/v1/roles/:id            # Update role (Admin)
DELETE /api/v1/roles/:id            # Delete role (Admin)
```

### Permissions

```
GET    /api/v1/permissions          # Get all permissions (Protected)
GET    /api/v1/permissions/:id      # Get permission by ID (Protected)
POST   /api/v1/permissions          # Create permission (Admin)
PATCH  /api/v1/permissions/:id      # Update permission (Admin)
DELETE /api/v1/permissions/:id      # Delete permission (Admin)
```

### Posts

```
GET    /api/v1/posts                # Get all posts (paginated)
GET    /api/v1/posts/:id            # Get post by ID
POST   /api/v1/posts                # Create post
PATCH  /api/v1/posts/:id            # Update post
DELETE /api/v1/posts/:id            # Delete post
```

## Usage Examples

### Two-Step Registration

```bash
# Step 1: Initiate registration (sends 6-digit code to email)
curl -X POST http://localhost:5002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "name": "John Doe"
  }'

# Step 2: Verify email with code from email
curl -X POST http://localhost:5002/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
# Returns: { user, tokens: { accessToken, refreshToken } }
```

### Login

```bash
curl -X POST http://localhost:5002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### Forgot & Reset Password

```bash
# Request reset link (returns token for testing without frontend)
curl -X POST http://localhost:5002/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com" }'

# Reset password with token
curl -X POST http://localhost:5002/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-from-forgot-password-response",
    "newPassword": "NewPassword123"
  }'
```

### Change Password (Authenticated)

```bash
curl -X POST http://localhost:5002/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "oldPassword": "Password123",
    "newPassword": "NewPassword123"
  }'
```

### Access Protected Route

```bash
curl -X GET http://localhost:5002/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Password Rules

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Security Features

1. **Helmet** - Security HTTP headers
2. **CORS** - Configurable allowed origins
3. **Rate Limiting** - 100 requests per 15 minutes (configurable)
4. **Password Hashing** - bcrypt with configurable rounds
5. **JWT** - Access tokens (15min) + Refresh tokens (7 days, DB-backed, revocable)
6. **Input Validation** - Zod schemas on all endpoints
7. **Email Verification** - 6-digit code with 15-minute expiry
8. **Reset Token** - SHA-256 hashed, single-use, 15-minute expiry

## Error Handling

Custom error classes with consistent responses:

| Class | Status | Usage |
|---|---|---|
| `BadRequestError` | 400 | Invalid input, expired tokens |
| `UnauthorizedError` | 401 | Missing/invalid auth, unverified email |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate email/unique constraint |
| `ValidationError` | 422 | Zod validation failures |
| `InternalServerError` | 500 | Unexpected errors |

## RBAC System

Permission-based (not role-name-based). Permissions follow `resource:action` pattern.

### Seeded Permissions (12)

| Permission | Description |
|---|---|
| `user:read` | View users |
| `user:create` | Create users |
| `user:update` | Update users |
| `user:delete` | Delete users |
| `role:read` | View roles |
| `role:create` | Create roles |
| `role:update` | Update roles |
| `role:delete` | Delete roles |
| `permission:read` | View permissions |
| `permission:create` | Create permissions |
| `permission:update` | Update permissions |
| `permission:delete` | Delete permissions |

### Seeded Roles (3)

| Role | Permissions |
|---|---|
| **superadmin** | All 12 permissions |
| **admin** | `user:read`, `user:create`, `user:update`, `role:read`, `permission:read` |
| **user** | `user:read` |

### Default User

| Field | Value |
|---|---|
| Email | `superadmin@example.com` |
| Password | `SuperAdmin123!` |
| Role | superadmin |

### How It Works

1. User logs in -> JWT token includes `role` ID and `permissions` array
2. Protected routes use `authenticate` middleware to verify token
3. Permission-protected routes use `requirePermissions()` middleware

```typescript
router.get("/admin/users",
  authenticate,
  requirePermissions("user:read"),
  controller.getAll
);

router.delete("/admin/users/:id",
  authenticate,
  requirePermissions("user:delete"),
  controller.delete
);
```

If permissions are missing, returns `403 Forbidden` with the list of missing permissions:

```json
{
  "status": false,
  "message": "Missing permissions: user:delete"
}
```

## Generate New Modules

Scaffold a full CRUD module with one command:

```bash
npm run generate product
```

This creates:

```
src/modules/product/
├── product.validation.ts    # Zod schemas (getAll, create, update, getById)
├── product.service.ts       # Prisma CRUD with pagination
├── product.controller.ts    # Express handlers
└── product.route.ts         # Router with auth middleware
```

Also updates:
- `src/routes.ts` - adds route import and registration
- `prisma/schema.prisma` - adds model with id, name, createdAt, updatedAt
- Runs `prisma generate` and `prisma migrate dev` automatically

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| id | Int | Auto-increment PK |
| name | VARCHAR(255) | |
| email | VARCHAR(255) | Unique |
| password | VARCHAR(255) | bcrypt hashed |
| emailVerified | Boolean | Default false |
| roleId | String? | FK to Role |

### RefreshToken
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| token | String | Unique |
| userId | Int | FK to User |
| expiresAt | DateTime | |
| revokedAt | DateTime? | null = active |

### VerificationToken
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | |
| code | VARCHAR(10) | 6-digit code |
| password | VARCHAR(255) | Pre-hashed password |
| name | VARCHAR(255) | |
| expiresAt | DateTime | 15 minutes |

### PasswordResetToken
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| token | String | SHA-256 hashed |
| userId | Int | FK to User |
| expiresAt | DateTime | 15 minutes |
| usedAt | DateTime? | null = unused |

## License

MIT
