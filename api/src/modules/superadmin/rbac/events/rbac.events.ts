import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class RbacEvents {
  @OnEvent("role.created")
  handleRoleCreated(payload: { role: any; tenantId: string }) {
    console.log(`Role created: ${payload.role.name} in tenant ${payload.tenantId}`);
    // Add any additional logic here (e.g., audit logging, notifications)
  }

  @OnEvent("role.updated")
  handleRoleUpdated(payload: { role: any; tenantId: string }) {
    console.log(`Role updated: ${payload.role.name} in tenant ${payload.tenantId}`);
    // Add any additional logic here
  }

  @OnEvent("role.deleted")
  handleRoleDeleted(payload: { roleId: string; tenantId: string }) {
    console.log(`Role deleted: ${payload.roleId} in tenant ${payload.tenantId}`);
    // Add any additional logic here
  }

  @OnEvent("permission.created")
  handlePermissionCreated(payload: { permission: any }) {
    console.log(`Permission created: ${payload.permission.name}`);
    // Add any additional logic here
  }

  @OnEvent("permission.updated")
  handlePermissionUpdated(payload: { permission: any }) {
    console.log(`Permission updated: ${payload.permission.name}`);
    // Add any additional logic here
  }

  @OnEvent("permission.deleted")
  handlePermissionDeleted(payload: { permissionId: string }) {
    console.log(`Permission deleted: ${payload.permissionId}`);
    // Add any additional logic here
  }

  @OnEvent("role.permissions.assigned")
  handleRolePermissionsAssigned(payload: { role: any; permissionIds: string[]; tenantId: string }) {
    console.log(
      `Permissions assigned to role ${payload.role.name}: ${payload.permissionIds.join(", ")}`,
    );
    // Add any additional logic here
  }

  @OnEvent("role.permissions.removed")
  handleRolePermissionsRemoved(payload: { role: any; permissionIds: string[]; tenantId: string }) {
    console.log(
      `Permissions removed from role ${payload.role.name}: ${payload.permissionIds.join(", ")}`,
    );
    // Add any additional logic here
  }

  @OnEvent("user.role.assigned")
  handleUserRoleAssigned(payload: { user: any; role: any; tenantId: string }) {
    console.log(`Role ${payload.role.name} assigned to user ${payload.user.email}`);
    // Add any additional logic here
  }

  @OnEvent("user.role.removed")
  handleUserRoleRemoved(payload: { user: any; roleId: string; tenantId: string }) {
    console.log(`Role ${payload.roleId} removed from user ${payload.user.email}`);
    // Add any additional logic here
  }
}
