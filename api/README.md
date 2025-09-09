# G4A School Management Portal API

A comprehensive, multi-tenant REST API built with NestJS, TypeScript, and PostgreSQL. This API provides authentication, user management, and multi-tenant capabilities for the G4A School Management Portal.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Multi-Tenant Architecture** - Complete data isolation between organizations
- **Role-Based Access Control (RBAC)** - Granular permissions system
- **SSO Integration** - Google, Facebook, GitHub, and Twitter OAuth support
- **Magic Link Login** - Passwordless authentication via email
- **Password Security** - bcrypt hashing with configurable policies
- **Server-Side Cookies** - HTTP-only cookies for enhanced security

### 🏢 Multi-Tenant Management
- **Tenant Isolation** - Complete data separation between organizations
- **School Context** - Optional school-level access control within tenants
- **Dynamic Database Switching** - Automatic database connection based on tenant
- **Tenant Management** - CRUD operations for tenant management

### 📊 Health Monitoring
- **Health Checks** - Application health and readiness monitoring
- **Graceful Shutdown** - Proper resource cleanup on application termination
- **Database Monitoring** - Connection status and performance metrics

### 🎯 User Onboarding System
- **Step-by-Step Workflow** - Guided onboarding process with progress tracking
- **Role-Based Onboarding** - Different flows for students, teachers, and administrators
- **School Registration** - Complete school setup and verification process
- **Approval Workflow** - Admin approval system for sensitive operations
- **Progress Tracking** - Real-time progress monitoring and analytics
- **State Management** - Robust state machine for onboarding flow control

## 🛠️ Technology Stack

- **NestJS** - Scalable Node.js framework with decorators and dependency injection
- **TypeScript** - Type-safe backend development
- **PostgreSQL** - Primary database with multi-tenant support
- **TypeORM** - Object-Relational Mapping with migrations
- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication strategies (JWT, OAuth, Local)
- **Swagger/OpenAPI** - API documentation and testing
- **Jest** - Testing framework with comprehensive coverage
- **Biome** - Fast linter and formatter
- **Husky** - Git hooks for code quality

## 📁 Project Structure

```
api/
├── src/
│   ├── database/           # Database configuration and entities
│   │   └── entities/       # TypeORM entities
│   │       ├── user.entity.ts
│   │       ├── role.entity.ts
│   │       ├── permission.entity.ts
│   │       ├── tenant.entity.ts
│   │       └── school.entity.ts
│   ├── shared/             # Shared utilities and services
│   │   ├── auth/           # Authentication system
│   │   │   ├── dto/        # Data Transfer Objects
│   │   │   ├── guards/     # Authentication guards
│   │   │   ├── strategies/ # Passport strategies
│   │   │   └── decorators/ # Custom decorators
│   │   ├── services/       # Shared services
│   │   │   ├── jwt.service.ts
│   │   │   ├── cookie.service.ts
│   │   │   └── health-check.service.ts
│   │   ├── modules/            # Feature modules
│   │   │   └── superadmin/     # Superadmin functionality
│   │   │       └── onboarding/ # User onboarding system
│   │   └── types/          # Shared TypeScript types
│   ├── tenant/             # Multi-tenant management
│   │   ├── tenant.service.ts
│   │   ├── tenant.controller.ts
│   │   └── database-manager.service.ts
│   ├── config/             # Configuration files
│   │   └── configuration.ts
│   └── main.ts             # Application entry point
├── test/                   # E2E tests
├── migrations/             # Database migrations
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or higher)
- **PostgreSQL** (v12 or higher)
- **Yarn** (v1.22 or higher)

### Installation

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database**
   ```bash
   # Start PostgreSQL
   # Create the master database
   createdb g4a_master
   
   # Run migrations
   yarn migration:run
   ```

4. **Start the development server**
   ```bash
   yarn start:dev
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Swagger Documentation

Interactive API documentation is available at `/api/docs` when the server is running.

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login with email/password |
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| POST | `/api/v1/auth/magic-link/request` | Request magic link login |
| POST | `/api/v1/auth/magic-link/verify` | Verify magic link |
| GET | `/api/v1/auth/sso/:provider` | Initiate SSO login |
| GET | `/api/v1/auth/sso/:provider/callback` | SSO callback handler |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | User logout |
| GET | `/api/v1/auth/me` | Get current user profile |

### Health Check Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Basic health check |
| GET | `/api/v1/health/ready` | Readiness check |
| GET | `/api/v1/health/detailed` | Detailed health status |

### Multi-Tenant Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tenants` | Create new tenant |
| GET | `/api/v1/tenants` | List tenants |
| GET | `/api/v1/tenants/:id` | Get tenant details |
| PUT | `/api/v1/tenants/:id` | Update tenant |
| DELETE | `/api/v1/tenants/:id` | Delete tenant |

## 🔧 Configuration

### Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
COOKIE_DOMAIN=localhost

# Database Configuration
MASTER_DATABASE_URL=postgresql://user:password@localhost:5432/g4a_master
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME_PREFIX=g4a_tenant_
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_MIGRATIONS_RUN=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

# SSO Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/sso/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/v1/auth/sso/facebook/callback
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:cov

# Run E2E tests
yarn test:e2e

# Run tests in watch mode
yarn test:watch
```

### Test Structure

- **Unit Tests** - Individual service and controller tests
- **Integration Tests** - API endpoint tests
- **E2E Tests** - End-to-end application tests

## 🗄️ Database

### Entities

- **User** - Core user entity with tenant and school relationships
- **Role** - Tenant-specific roles with permissions
- **Permission** - Granular permissions for fine-grained access control
- **Tenant** - Multi-tenant organization entity
- **School** - Educational institution within a tenant
- **UserOnboarding** - Onboarding workflow state and progress tracking (Superadmin module)

### Migrations

```bash
# Generate migration
yarn migration:generate -- -n MigrationName

# Run migrations
yarn migration:run

# Revert migration
yarn migration:revert

# Show migration status
yarn migration:show
```

## 🔐 Security Features

### Authentication

- **JWT Tokens** - Secure access and refresh tokens
- **Password Hashing** - bcrypt with 12 salt rounds
- **Token Expiration** - Configurable token lifetimes
- **Refresh Tokens** - Secure token refresh mechanism

### Authorization

- **Role-Based Access Control** - User roles and permissions
- **Tenant Isolation** - Complete data separation
- **Guard System** - Multiple authentication and authorization guards
- **Decorator System** - Easy-to-use authorization decorators

### Security Headers

- **CORS** - Configurable cross-origin resource sharing
- **HTTP-Only Cookies** - XSS protection
- **Secure Cookies** - HTTPS-only in production
- **SameSite** - CSRF protection

## 🚀 Deployment

### Production Build

```bash
# Build the application
yarn build

# Start production server
yarn start:prod
```

### Docker Deployment

```bash
# Build Docker image
docker build -t g4a-api .

# Run container
docker run -p 3000:3000 g4a-api
```

### Environment Setup

1. Set production environment variables
2. Configure database connections
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging

## 📊 Monitoring

### Health Checks

- **Basic Health** - Application status
- **Readiness** - Service readiness
- **Detailed Status** - Database and service status

### Logging

- **Structured Logging** - JSON-formatted logs
- **Log Levels** - Configurable log levels
- **Request Logging** - HTTP request/response logging
- **Error Tracking** - Comprehensive error logging

## 📚 API Documentation

### Superadmin Onboarding Endpoints

The API provides comprehensive onboarding management for superadmins with the following endpoints:

#### User Onboarding
- `POST /onboarding/initialize` - Initialize onboarding for the current user
- `POST /onboarding/start` - Start the onboarding process
- `PUT /onboarding/step` - Complete a specific onboarding step
- `GET /onboarding/progress` - Get current onboarding progress
- `POST /onboarding/abandon` - Abandon the onboarding process
- `POST /onboarding/require-approval` - Mark onboarding as requiring approval

#### Admin Endpoints
- `POST /onboarding/approve/:userId` - Approve user onboarding (Admin only)
- `GET /onboarding/pending-approval` - Get onboardings requiring approval (Admin only)
- `GET /onboarding/stats` - Get onboarding statistics (Super Admin only)
- `POST /onboarding/reset/:userId` - Reset user onboarding (Super Admin only)

#### Onboarding Steps
1. **Account Creation** - Initial user account setup
2. **Email Verification** - Verify user email address
3. **Profile Setup** - Complete user profile information
4. **School Selection** - Choose or create school
5. **School Registration** - Register new school (if needed)
6. **School Verification** - Admin verification of school
7. **Role Selection** - Choose user role (student, teacher, admin)
8. **Permissions Setup** - Configure role-based permissions
9. **Dashboard Tour** - Introduction to the platform
10. **Completion** - Finalize onboarding process

#### Onboarding States
- `not_started` - Onboarding not yet initiated
- `in_progress` - Onboarding is currently active
- `completed` - Onboarding successfully finished
- `abandoned` - User abandoned the process
- `requires_approval` - Waiting for admin approval

### Authentication Endpoints

- `POST /auth/login` - User login with email/password
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/magic-link` - Request magic link login
- `POST /auth/verify-email` - Verify email address

### Multi-Tenant Endpoints

- `GET /tenants` - List all tenants (Super Admin)
- `POST /tenants` - Create new tenant (Super Admin)
- `GET /tenants/:id` - Get tenant details
- `PUT /tenants/:id` - Update tenant
- `DELETE /tenants/:id` - Delete tenant (Super Admin)

## 🔧 Development

### Code Quality

- **Biome** - Fast linter and formatter
- **TypeScript** - Strict type checking
- **Husky** - Git hooks for code quality
- **Conventional Commits** - Automated versioning

### Available Scripts

```bash
# Development
yarn start:dev          # Start in development mode
yarn start:debug        # Start in debug mode

# Building
yarn build              # Build for production
yarn start:prod         # Start production server

# Testing
yarn test               # Run unit tests
yarn test:cov           # Run tests with coverage
yarn test:e2e           # Run E2E tests
yarn test:watch         # Run tests in watch mode

# Database
yarn migration:generate # Generate migration
yarn migration:run      # Run migrations
yarn migration:revert   # Revert migration
yarn migration:show     # Show migration status

# Code Quality
yarn lint               # Lint code
yarn lint:fix           # Fix linting issues
yarn format             # Format code
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Document new features
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Favour Max-Oti** - *Initial work* - [maxotif@gmail.com](mailto:maxotif@gmail.com)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database management with [TypeORM](https://typeorm.io/)
- Authentication with [Passport](http://www.passportjs.org/)
- Documentation with [Swagger](https://swagger.io/)
- Testing with [Jest](https://jestjs.io/)

---

**G4A School Management Portal API** - Empowering education through technology.