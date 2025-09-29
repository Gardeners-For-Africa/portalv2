import * as bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import { Role } from "../entities/role.entity";
import { Tenant } from "../entities/tenant.entity";
import { User, UserStatus, UserType } from "../entities/user.entity";

export class SuperadminSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log("Starting superadmin seeding...");

    try {
      // Create system tenant if it doesn't exist
      const systemTenant = await this.createSystemTenant();

      // Create super admin role if it doesn't exist
      const superAdminRole = await this.createSuperAdminRole(systemTenant.id);

      // Create default superadmin users
      await this.createDefaultSuperadmins(systemTenant.id, superAdminRole.id);

      console.log("Superadmin seeding completed successfully!");
    } catch (error) {
      console.error("Error during superadmin seeding:", error);
      throw error;
    }
  }

  private async createSystemTenant(): Promise<Tenant> {
    const tenantRepository = this.dataSource.getRepository(Tenant);

    let systemTenant = await tenantRepository.findOne({
      where: { subdomain: "system" },
    });

    if (!systemTenant) {
      systemTenant = tenantRepository.create({
        name: "System",
        subdomain: "system",
        domain: "system.localhost",
        databaseName: "g4a_system",
        isActive: true,
        description: "System tenant for super administrators",
        settings: {
          isSystemTenant: true,
          allowSuperAdminAccess: true,
        },
      });

      await tenantRepository.save(systemTenant);
      console.log("Created system tenant");
    } else {
      console.log("System tenant already exists");
    }

    return systemTenant;
  }

  private async createSuperAdminRole(tenantId: string): Promise<Role> {
    const roleRepository = this.dataSource.getRepository(Role);

    let superAdminRole = await roleRepository.findOne({
      where: {
        name: "super_admin",
        tenantId: tenantId,
      },
    });

    if (!superAdminRole) {
      superAdminRole = roleRepository.create({
        name: "super_admin",
        description: "Full system access with all permissions",
        isActive: true,
        tenantId: tenantId,
        metadata: {
          level: 1,
          permissions: ["*"],
          isSuperAdmin: true,
          isSystemRole: true,
        },
      });

      await roleRepository.save(superAdminRole);
      console.log("Created super admin role");
    } else {
      console.log("Super admin role already exists");
    }

    return superAdminRole;
  }

  private async createDefaultSuperadmins(tenantId: string, roleId: string): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);

    const superAdminRole = await roleRepository.findOne({
      where: { id: roleId },
    });

    if (!superAdminRole) {
      throw new Error("Super admin role not found");
    }

    const defaultSuperadmins = [
      {
        firstName: "Chisom",
        lastName: "Obi",
        email: "chisom.obi@gardeners4africa.com",
        password: "SuperAdmin123!",
        userType: UserType.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        tenantId: tenantId,
        emailVerifiedAt: new Date(),
        metadata: {
          isDefaultSuperAdmin: true,
          createdBy: "system",
        },
      },
      {
        firstName: "Super",
        lastName: "Admin",
        email: "superadmin@gardeners4africa.com",
        password: "SuperAdmin123!",
        userType: UserType.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        tenantId: tenantId,
        emailVerifiedAt: new Date(),
        metadata: {
          isDefaultSuperAdmin: true,
          createdBy: "system",
        },
      },
    ];

    for (const adminData of defaultSuperadmins) {
      const existingAdmin = await userRepository.findOne({
        where: { email: adminData.email },
      });

      if (!existingAdmin) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(adminData.password, 12);

        const superAdmin = userRepository.create({
          ...adminData,
          password: hashedPassword,
          roles: [superAdminRole],
        });

        await userRepository.save(superAdmin);
        console.log(`Created superadmin: ${adminData.email}`);
      } else {
        console.log(`Superadmin already exists: ${adminData.email}`);
      }
    }
  }
}
