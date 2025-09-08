# Multi-Tenant PostgreSQL Setup

This document explains how to set up and use the multi-tenant PostgreSQL configuration for the G4A School Management Portal API.

## Overview

The multi-tenant setup uses a master database to store tenant information and separate databases for each tenant's data. This provides:

- **Data Isolation**: Each tenant's data is completely separated
- **Scalability**: Individual tenant databases can be scaled independently
- **Security**: No cross-tenant data access is possible
- **Performance**: Tenant-specific queries are faster

## Architecture

```
Master Database (g4a_master)
├── tenants table
└── schools table

Tenant Databases (g4a_tenant_*)
├── tenant-specific tables
└── tenant-specific data
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Master Database (for tenant management)
MASTER_DATABASE_URL=postgresql://username:password@localhost:5432/g4a_master

# Database Connection Settings
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=username
DB_PASSWORD=password
DB_NAME_PREFIX=g4a_tenant_

# TypeORM Settings
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_MIGRATIONS_RUN=true
```

### Database Setup

1. **Create Master Database**:
   ```sql
   CREATE DATABASE g4a_master;
   ```

2. **Enable UUID Extension** (if not already enabled):
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

3. **Run Migrations**:
   ```bash
   yarn migration:run
   ```

## Usage

### 1. Tenant-Aware Controllers

Use the `@UseGuards(TenantGuard)` decorator to make controllers tenant-aware:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { TenantContext, TenantId } from './decorators/tenant.decorator';

@Controller('students')
@UseGuards(TenantGuard)
export class StudentsController {
  @Get()
  async getStudents(@TenantContext() tenantContext: TenantContext) {
    // Access tenant information
    const tenantId = tenantContext.tenant.id;
    const databaseName = tenantContext.databaseName;
    
    // Your tenant-specific logic here
    return { students: [], tenant: tenantContext.tenant };
  }
}
```

### 2. Tenant Decorators

- `@TenantContext()`: Get full tenant context
- `@TenantId()`: Get tenant ID only
- `@SchoolId()`: Get school ID (if provided in headers)

### 3. Request Headers

For development, you can specify the school ID using headers:

```bash
curl -H "X-School-ID: school-uuid" http://tenant1.localhost:3000/api/v1/students
```

### 4. Subdomain Resolution

The system automatically detects tenants based on subdomains:

- `tenant1.localhost:3000` → tenant with subdomain "tenant1"
- `school.example.com` → tenant with domain "school.example.com"

## API Endpoints

### Tenant Management

- `POST /api/v1/tenants` - Create a new tenant
- `GET /api/v1/tenants` - List all tenants
- `GET /api/v1/tenants/:id` - Get tenant by ID
- `PUT /api/v1/tenants/:id` - Update tenant
- `DELETE /api/v1/tenants/:id` - Delete tenant

### Tenant-Aware Endpoints

- `GET /api/v1/tenant-aware/info` - Get tenant information
- `GET /api/v1/tenant-aware/tenant-id` - Get tenant ID
- `GET /api/v1/tenant-aware/school-id` - Get school ID

## Database Management

### Creating Tenant Databases

When a new tenant is created, the system automatically:

1. Creates a new database: `g4a_tenant_{tenant_id}`
2. Establishes a connection to the tenant database
3. Runs any necessary migrations

### Database Connection Management

The `DatabaseManagerService` handles:

- Creating tenant database connections
- Caching connections for performance
- Cleaning up unused connections
- Graceful shutdown of all connections

## Development Setup

### 1. Local Development

For local development, you can use subdomains by:

1. Adding entries to your `/etc/hosts` file:
   ```
   127.0.0.1 tenant1.localhost
   127.0.0.1 tenant2.localhost
   ```

2. Accessing your application:
   - `http://tenant1.localhost:3000` - Tenant 1
   - `http://tenant2.localhost:3000` - Tenant 2

### 2. Testing

Use the tenant-aware endpoints to test multi-tenancy:

```bash
# Test tenant detection
curl http://tenant1.localhost:3000/api/v1/tenant-aware/info

# Test with school context
curl -H "X-School-ID: school-uuid" http://tenant1.localhost:3000/api/v1/tenant-aware/info
```

## Security Considerations

1. **Database Isolation**: Each tenant has a completely separate database
2. **Connection Security**: Database connections are managed securely
3. **Tenant Validation**: All requests are validated against active tenants
4. **Subdomain Validation**: Only registered subdomains/domains are allowed

## Monitoring

Monitor the following:

- Database connection counts
- Tenant database sizes
- Query performance per tenant
- Failed tenant authentications

## Troubleshooting

### Common Issues

1. **Tenant Not Found**: Ensure the subdomain/domain is registered
2. **Database Connection Failed**: Check database credentials and network
3. **Migration Errors**: Ensure master database is properly set up

### Logs

Check the application logs for:
- Tenant resolution attempts
- Database connection status
- Guard authentication results

## Production Deployment

1. **Database Setup**: Ensure master database is created and migrated
2. **DNS Configuration**: Set up proper subdomain/domain routing
3. **SSL Certificates**: Configure SSL for custom domains
4. **Monitoring**: Set up database and application monitoring
5. **Backup Strategy**: Implement tenant database backup procedures
