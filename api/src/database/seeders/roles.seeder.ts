import { DataSource } from "typeorm";
import { Role } from "../entities/role.entity";
import { Tenant } from "../entities/tenant.entity";

export class RolesSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(Role);
    const tenantRepository = this.dataSource.getRepository(Tenant);

    // Get the system tenant
    const systemTenant = await tenantRepository.findOne({
      where: { subdomain: "system" },
    });

    if (!systemTenant) {
      throw new Error("System tenant not found. Please run superadmin seeder first.");
    }

    const roles = [
      {
        name: "school_admin",
        description: "Administrative access to school management features",
        isActive: true,
        tenantId: systemTenant.id,
        metadata: {
          level: 2,
          permissions: [
            "school:read",
            "school:write",
            "school:delete",
            "user:read",
            "user:write",
            "student:read",
            "student:write",
            "teacher:read",
            "teacher:write",
            "class:read",
            "class:write",
            "class:delete",
            "subject:read",
            "subject:write",
            "subject:delete",
            "grade:read",
            "grade:write",
            "attendance:read",
            "attendance:write",
            "report:read",
            "report:write",
          ],
          isSystemRole: false,
        },
      },
      {
        name: "teacher",
        description: "Access to teaching and student management features",
        isActive: true,
        tenantId: systemTenant.id,
        metadata: {
          level: 3,
          permissions: [
            "student:read",
            "class:read",
            "subject:read",
            "grade:read",
            "grade:write",
            "attendance:read",
            "attendance:write",
            "assignment:read",
            "assignment:write",
            "assignment:delete",
            "exam:read",
            "exam:write",
            "report:read",
          ],
          isSystemRole: false,
        },
      },
      {
        name: "student",
        description: "Access to student-specific features and information",
        isActive: true,
        tenantId: systemTenant.id,
        metadata: {
          level: 4,
          permissions: [
            "profile:read",
            "profile:write",
            "grade:read",
            "attendance:read",
            "assignment:read",
            "exam:read",
            "timetable:read",
            "notification:read",
          ],
          isSystemRole: false,
        },
      },
      {
        name: "parent",
        description: "Access to child's academic information and school updates",
        isActive: true,
        tenantId: systemTenant.id,
        metadata: {
          level: 4,
          permissions: [
            "profile:read",
            "profile:write",
            "child:read",
            "grade:read",
            "attendance:read",
            "assignment:read",
            "exam:read",
            "timetable:read",
            "notification:read",
            "report:read",
          ],
          isSystemRole: false,
        },
      },
      {
        name: "school_registrar",
        description: "Access to school registration and enrollment management",
        isActive: true,
        tenantId: systemTenant.id,
        metadata: {
          level: 3,
          permissions: [
            "school_registration:read",
            "school_registration:write",
            "school_registration:review",
            "enrollment:read",
            "enrollment:write",
            "student:read",
            "student:write",
            "report:read",
          ],
          isSystemRole: false,
        },
      },
      {
        name: "finance_admin",
        description: "Access to financial management and payment features",
        isActive: true,
        tenantId: systemTenant.id,
        metadata: {
          level: 3,
          permissions: [
            "payment:read",
            "payment:write",
            "invoice:read",
            "invoice:write",
            "fee:read",
            "fee:write",
            "report:read",
            "report:write",
          ],
          isSystemRole: false,
        },
      },
    ];

    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({
        where: {
          name: roleData.name,
          tenantId: systemTenant.id,
        },
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role already exists: ${roleData.name}`);
      }
    }
  }
}
