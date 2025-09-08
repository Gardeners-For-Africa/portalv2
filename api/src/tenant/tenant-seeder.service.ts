import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { Permission } from "../database/entities/permission.entity";
import { Role } from "../database/entities/role.entity";
import { School } from "../database/entities/school.entity";
import { Tenant } from "../database/entities/tenant.entity";
import { User } from "../database/entities/user.entity";

@Injectable()
export class TenantSeederService {
  private readonly logger = new Logger(TenantSeederService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Run seeders for a specific tenant database
   */
  async runSeeders(tenant: Tenant): Promise<void> {
    const databaseName = tenant.databaseName;
    this.logger.log(`🌱 Running seeders for tenant: ${tenant.name} (${databaseName})`);

    try {
      // Create a temporary data source for running seeders
      const dataSourceOptions = this.getTenantDataSourceOptions(tenant);
      const dataSource = new DataSource(dataSourceOptions);

      // Initialize the data source
      await dataSource.initialize();
      this.logger.log(`✅ Connected to tenant database for seeding: ${databaseName}`);

      // Run seeders
      await this.seedPermissions(dataSource);
      await this.seedRoles(dataSource, tenant.id);
      await this.seedDefaultSchool(dataSource, tenant.id);
      await this.seedDefaultAdminUser(dataSource, tenant.id);

      this.logger.log(`✅ Seeders completed for tenant: ${tenant.name}`);

      // Close the data source
      await dataSource.destroy();
      this.logger.log(`✅ Database connection closed for tenant: ${tenant.name}`);
    } catch (error) {
      this.logger.error(`❌ Failed to run seeders for tenant ${tenant.name}:`, error);
      throw error;
    }
  }

  /**
   * Seed default permissions
   */
  private async seedPermissions(dataSource: DataSource): Promise<void> {
    this.logger.log("🌱 Seeding permissions...");

    const permissionRepository = dataSource.getRepository(Permission);

    const permissions = [
      // User management permissions
      { name: "users.create", description: "Create users" },
      { name: "users.read", description: "Read users" },
      { name: "users.update", description: "Update users" },
      { name: "users.delete", description: "Delete users" },

      // School management permissions
      { name: "schools.create", description: "Create schools" },
      { name: "schools.read", description: "Read schools" },
      { name: "schools.update", description: "Update schools" },
      { name: "schools.delete", description: "Delete schools" },

      // Role management permissions
      { name: "roles.create", description: "Create roles" },
      { name: "roles.read", description: "Read roles" },
      { name: "roles.update", description: "Update roles" },
      { name: "roles.delete", description: "Delete roles" },

      // Student management permissions
      { name: "students.create", description: "Create students" },
      { name: "students.read", description: "Read students" },
      { name: "students.update", description: "Update students" },
      { name: "students.delete", description: "Delete students" },

      // Academic management permissions
      { name: "academics.create", description: "Create academic records" },
      { name: "academics.read", description: "Read academic records" },
      { name: "academics.update", description: "Update academic records" },
      { name: "academics.delete", description: "Delete academic records" },

      // Financial management permissions
      { name: "financials.create", description: "Create financial records" },
      { name: "financials.read", description: "Read financial records" },
      { name: "financials.update", description: "Update financial records" },
      { name: "financials.delete", description: "Delete financial records" },

      // Communication permissions
      { name: "communications.create", description: "Create communications" },
      { name: "communications.read", description: "Read communications" },
      { name: "communications.update", description: "Update communications" },
      { name: "communications.delete", description: "Delete communications" },

      // System administration permissions
      { name: "system.admin", description: "System administration" },
      { name: "system.settings", description: "System settings management" },
      { name: "system.reports", description: "Generate system reports" },
    ];

    for (const permissionData of permissions) {
      const existingPermission = await permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = permissionRepository.create(permissionData);
        await permissionRepository.save(permission);
        this.logger.log(`✅ Created permission: ${permissionData.name}`);
      }
    }

    this.logger.log("✅ Permissions seeding completed");
  }

  /**
   * Seed default roles
   */
  private async seedRoles(dataSource: DataSource, tenantId: string): Promise<void> {
    this.logger.log("🌱 Seeding roles...");

    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    // Get all permissions
    const allPermissions = await permissionRepository.find();

    // Super Admin role - has all permissions
    const superAdminRole = await this.createRoleIfNotExists(roleRepository, {
      name: "Super Admin",
      description: "Full system access with all permissions",
      tenantId,
    });

    if (superAdminRole) {
      superAdminRole.permissions = allPermissions;
      await roleRepository.save(superAdminRole);
      this.logger.log("✅ Created Super Admin role with all permissions");
    }

    // School Admin role - has most permissions except system admin
    const schoolAdminPermissions = allPermissions.filter(
      (p) => !p.name.startsWith("system.") && !p.name.startsWith("roles."),
    );

    const schoolAdminRole = await this.createRoleIfNotExists(roleRepository, {
      name: "School Admin",
      description: "School administration with limited system access",
      tenantId,
    });

    if (schoolAdminRole) {
      schoolAdminRole.permissions = schoolAdminPermissions;
      await roleRepository.save(schoolAdminRole);
      this.logger.log("✅ Created School Admin role");
    }

    // Teacher role - has student and academic permissions
    const teacherPermissions = allPermissions.filter(
      (p) =>
        p.name.startsWith("students.") ||
        p.name.startsWith("academics.") ||
        p.name.startsWith("communications."),
    );

    const teacherRole = await this.createRoleIfNotExists(roleRepository, {
      name: "Teacher",
      description: "Teacher with access to student and academic management",
      tenantId,
    });

    if (teacherRole) {
      teacherRole.permissions = teacherPermissions;
      await roleRepository.save(teacherRole);
      this.logger.log("✅ Created Teacher role");
    }

    // Student role - has limited read permissions
    const studentPermissions = allPermissions.filter(
      (p) => p.name === "students.read" || p.name === "academics.read",
    );

    const studentRole = await this.createRoleIfNotExists(roleRepository, {
      name: "Student",
      description: "Student with limited read access",
      tenantId,
    });

    if (studentRole) {
      studentRole.permissions = studentPermissions;
      await roleRepository.save(studentRole);
      this.logger.log("✅ Created Student role");
    }

    this.logger.log("✅ Roles seeding completed");
  }

  /**
   * Seed default school for the tenant
   */
  private async seedDefaultSchool(dataSource: DataSource, tenantId: string): Promise<void> {
    this.logger.log("🌱 Seeding default school...");

    const schoolRepository = dataSource.getRepository(School);

    const defaultSchool = await this.createSchoolIfNotExists(schoolRepository, {
      name: "Main School",
      code: "MAIN",
      tenantId,
    });

    if (defaultSchool) {
      this.logger.log("✅ Created default school");
    }
  }

  /**
   * Seed default admin user
   */
  private async seedDefaultAdminUser(dataSource: DataSource, tenantId: string): Promise<void> {
    this.logger.log("🌱 Seeding default admin user...");

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Get the Super Admin role
    const superAdminRole = await roleRepository.findOne({
      where: { name: "Super Admin", tenantId },
      relations: ["permissions"],
    });

    if (!superAdminRole) {
      this.logger.warn("⚠️ Super Admin role not found, skipping admin user creation");
      return;
    }

    const adminUser = await this.createUserIfNotExists(userRepository, {
      email: "admin@example.com",
      password: "admin123", // This should be hashed
      firstName: "System",
      lastName: "Administrator",
      userType: "admin",
      status: "active",
      tenantId,
      roles: [superAdminRole],
    });

    if (adminUser) {
      this.logger.log("✅ Created default admin user (admin@example.com / admin123)");
    }
  }

  /**
   * Helper method to create role if it doesn't exist
   */
  private async createRoleIfNotExists(roleRepository: any, roleData: any): Promise<Role | null> {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name, tenantId: roleData.tenantId },
    });

    if (existingRole) {
      return null; // Role already exists
    }

    const role = roleRepository.create(roleData);
    return await roleRepository.save(role);
  }

  /**
   * Helper method to create school if it doesn't exist
   */
  private async createSchoolIfNotExists(
    schoolRepository: any,
    schoolData: any,
  ): Promise<School | null> {
    const existingSchool = await schoolRepository.findOne({
      where: { code: schoolData.code, tenantId: schoolData.tenantId },
    });

    if (existingSchool) {
      return null; // School already exists
    }

    const school = schoolRepository.create(schoolData);
    return await schoolRepository.save(school);
  }

  /**
   * Helper method to create user if it doesn't exist
   */
  private async createUserIfNotExists(userRepository: any, userData: any): Promise<User | null> {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email, tenantId: userData.tenantId },
    });

    if (existingUser) {
      return null; // User already exists
    }

    const user = userRepository.create(userData);
    return await userRepository.save(user);
  }

  /**
   * Get tenant-specific data source options
   */
  private getTenantDataSourceOptions(tenant: Tenant): DataSourceOptions {
    const dbConfig = this.configService.get("database");

    // Parse the master database URL to get connection details
    const masterUrl = new URL(dbConfig.masterDatabaseUrl);

    return {
      type: "postgres",
      host: masterUrl.hostname,
      port: parseInt(masterUrl.port, 10) || 5432,
      username: masterUrl.username,
      password: masterUrl.password,
      database: tenant.databaseName,
      entities: [User, Role, Permission, School],
      synchronize: false,
      logging: dbConfig.logging,
      migrationsRun: true, // Migrations should already be run
    };
  }
}
