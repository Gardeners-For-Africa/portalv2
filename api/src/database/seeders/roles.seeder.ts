import { DataSource } from "typeorm";
import { Role } from "../entities/role.entity";

export class RolesSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(Role);

    const roles = [
      {
        name: "super_admin",
        displayName: "Super Administrator",
        description: "Full system access with all permissions",
        isSystemRole: true,
        isActive: true,
        metadata: {
          level: 1,
          permissions: ["*"],
        },
      },
      {
        name: "school_admin",
        displayName: "School Administrator",
        description: "Administrative access to school management features",
        isSystemRole: false,
        isActive: true,
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
        },
      },
      {
        name: "teacher",
        displayName: "Teacher",
        description: "Access to teaching and student management features",
        isSystemRole: false,
        isActive: true,
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
        },
      },
      {
        name: "student",
        displayName: "Student",
        description: "Access to student-specific features and information",
        isSystemRole: false,
        isActive: true,
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
        },
      },
      {
        name: "parent",
        displayName: "Parent/Guardian",
        description: "Access to child's academic information and school updates",
        isSystemRole: false,
        isActive: true,
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
        },
      },
      {
        name: "school_registrar",
        displayName: "School Registrar",
        description: "Access to school registration and enrollment management",
        isSystemRole: false,
        isActive: true,
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
        },
      },
      {
        name: "finance_admin",
        displayName: "Finance Administrator",
        description: "Access to financial management and payment features",
        isSystemRole: false,
        isActive: true,
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
        },
      },
    ];

    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({ where: { name: roleData.name } });

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
