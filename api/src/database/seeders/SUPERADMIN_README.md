# Superadmin Seeder

This seeder creates system-level superadmin users for the G4A School Management Portal.

## What it does

The `SuperadminSeeder` creates:

1. **System Tenant**: A special tenant with subdomain "system" for super administrators
2. **Super Admin Role**: A role with full system permissions (`permissions: ["*"]`)
3. **Default Superadmin Users**: Two default superadmin accounts:
   - `admin@g4a.com` / `SuperAdmin123!`
   - `superadmin@g4a.com` / `SuperAdmin123!`

## Usage

### Run all seeders (includes superadmin seeder)
```bash
yarn seed:run
```

### Run only the superadmin seeder
```bash
yarn seed:superadmin
```

### Run standalone superadmin seeder
```bash
yarn seed:superadmin:standalone
```

## Default Credentials

After running the seeder, you can log in with these credentials:

- **Email**: `admin@g4a.com`
- **Password**: `SuperAdmin123!`

- **Email**: `superadmin@g4a.com`  
- **Password**: `SuperAdmin123!`

## Security Notes

⚠️ **Important**: Change the default passwords immediately after running the seeder in production environments.

The seeder creates users with:
- `UserType.SUPER_ADMIN`
- `UserStatus.ACTIVE`
- Pre-verified email addresses
- Full system permissions

## System Tenant

The seeder creates a special "system" tenant that:
- Has subdomain: `system`
- Has domain: `system.localhost`
- Contains metadata: `{ isSystemTenant: true, allowSuperAdminAccess: true }`
- Is used exclusively for super administrators

This allows superadmins to have system-wide access while maintaining the multi-tenant architecture.
