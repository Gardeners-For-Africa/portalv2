import { DataSource } from "typeorm";
import { Permission } from "../entities/permission.entity";
import { Role } from "../entities/role.entity";

export class RolePermissionsSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(Role);
    const permissionRepository = this.dataSource.getRepository(Permission);

    // Get all roles and permissions
    const roles = await roleRepository.find();
    const permissions = await permissionRepository.find();

    // Create a map of permissions by name for quick lookup
    const permissionMap = new Map(permissions.map((p) => [p.name, p]));

    // Define role-permission mappings
    const rolePermissionMappings = {
      super_admin: [
        // Super admin gets all permissions
        ...permissions.map((p) => p.name),
      ],
      school_admin: [
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
        "assignment:read",
        "assignment:write",
        "assignment:delete",
        "exam:read",
        "exam:write",
        "timetable:read",
        "enrollment:read",
        "enrollment:write",
        "payment:read",
        "payment:write",
        "invoice:read",
        "invoice:write",
        "fee:read",
        "fee:write",
        "report:read",
        "report:write",
        "notification:read",
        "profile:read",
        "profile:write",
      ],
      teacher: [
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
        "timetable:read",
        "report:read",
        "notification:read",
        "profile:read",
        "profile:write",
      ],
      student: [
        "profile:read",
        "profile:write",
        "grade:read",
        "attendance:read",
        "assignment:read",
        "exam:read",
        "timetable:read",
        "notification:read",
      ],
      parent: [
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
      school_registrar: [
        "school_registration:read",
        "school_registration:write",
        "school_registration:review",
        "enrollment:read",
        "enrollment:write",
        "student:read",
        "student:write",
        "report:read",
        "profile:read",
        "profile:write",
      ],
      finance_admin: [
        "payment:read",
        "payment:write",
        "invoice:read",
        "invoice:write",
        "fee:read",
        "fee:write",
        "report:read",
        "report:write",
        "profile:read",
        "profile:write",
      ],
    };

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(rolePermissionMappings)) {
      const role = roles.find((r) => r.name === roleName);

      if (!role) {
        console.log(`Role not found: ${roleName}`);
        continue;
      }

      // Clear existing permissions
      role.permissions = [];

      // Add new permissions
      for (const permissionName of permissionNames) {
        const permission = permissionMap.get(permissionName);
        if (permission) {
          role.permissions.push(permission);
        } else {
          console.log(`Permission not found: ${permissionName}`);
        }
      }

      // Save the role with updated permissions
      await roleRepository.save(role);
      console.log(
        `Updated permissions for role: ${roleName} (${role.permissions.length} permissions)`,
      );
    }
  }
}
