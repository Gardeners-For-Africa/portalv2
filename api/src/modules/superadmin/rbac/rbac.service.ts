import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Permission } from "../../../database/entities/permission.entity";
import { Role } from "../../../database/entities/role.entity";
import { User } from "../../../database/entities/user.entity";
import {
  AssignRoleDto,
  CreatePermissionDto,
  CreateRoleDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from "./dto/rbac.dto";

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  // Role Management
  async createRole(createRoleDto: CreateRoleDto, tenantId: string): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name, tenantId },
    });

    if (existingRole) {
      throw new BadRequestException("Role with this name already exists");
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      tenantId,
    });

    const savedRole = await this.roleRepository.save(role);

    this.eventEmitter.emit("role.created", { role: savedRole, tenantId });
    return savedRole;
  }

  async getRoles(tenantId: string, filters?: any): Promise<{ roles: Role[]; total: number }> {
    const query = this.roleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permissions", "permissions")
      .where("role.tenantId = :tenantId", { tenantId });

    if (filters?.isActive !== undefined) {
      query.andWhere("role.isActive = :isActive", { isActive: filters.isActive });
    }

    if (filters?.search) {
      query.andWhere("(role.name ILIKE :search OR role.description ILIKE :search)", {
        search: `%${filters.search}%`,
      });
    }

    const [roles, total] = await query.orderBy("role.createdAt", "DESC").getManyAndCount();

    return { roles, total };
  }

  async getRoleById(id: string, tenantId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, tenantId },
      relations: ["permissions", "users"],
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto, tenantId: string): Promise<Role> {
    const role = await this.getRoleById(id, tenantId);

    Object.assign(role, updateRoleDto);
    const savedRole = await this.roleRepository.save(role);

    this.eventEmitter.emit("role.updated", { role: savedRole, tenantId });
    return savedRole;
  }

  async deleteRole(id: string, tenantId: string): Promise<void> {
    const role = await this.getRoleById(id, tenantId);

    // Check if role is assigned to users
    const userCount = await this.userRepository.count({
      where: { roles: { id: role.id } },
    });

    if (userCount > 0) {
      throw new BadRequestException("Cannot delete role that is assigned to users");
    }

    await this.roleRepository.remove(role);
    this.eventEmitter.emit("role.deleted", { roleId: id, tenantId });
  }

  // Permission Management
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new BadRequestException("Permission with this name already exists");
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    const savedPermission = await this.permissionRepository.save(permission);

    this.eventEmitter.emit("permission.created", { permission: savedPermission });
    return savedPermission;
  }

  async getPermissions(filters?: any): Promise<{ permissions: Permission[]; total: number }> {
    const query = this.permissionRepository
      .createQueryBuilder("permission")
      .leftJoinAndSelect("permission.roles", "roles");

    if (filters?.isActive !== undefined) {
      query.andWhere("permission.isActive = :isActive", { isActive: filters.isActive });
    }

    if (filters?.category) {
      query.andWhere("permission.metadata->>'category' = :category", {
        category: filters.category,
      });
    }

    if (filters?.search) {
      query.andWhere("(permission.name ILIKE :search OR permission.description ILIKE :search)", {
        search: `%${filters.search}%`,
      });
    }

    const [permissions, total] = await query.orderBy("permission.name", "ASC").getManyAndCount();

    return { permissions, total };
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ["roles"],
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    return permission;
  }

  async updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.getPermissionById(id);

    Object.assign(permission, updatePermissionDto);
    const savedPermission = await this.permissionRepository.save(permission);

    this.eventEmitter.emit("permission.updated", { permission: savedPermission });
    return savedPermission;
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.getPermissionById(id);

    // Check if permission is assigned to roles
    const roleCount = await this.roleRepository.count({
      where: { permissions: { id: permission.id } },
    });

    if (roleCount > 0) {
      throw new BadRequestException("Cannot delete permission that is assigned to roles");
    }

    await this.permissionRepository.remove(permission);
    this.eventEmitter.emit("permission.deleted", { permissionId: id });
  }

  // Role-Permission Management
  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    tenantId: string,
  ): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);
    const permissions = await this.permissionRepository.findBy({ id: In(permissionIds) });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException("One or more permissions not found");
    }

    role.permissions = permissions;
    const savedRole = await this.roleRepository.save(role);

    this.eventEmitter.emit("role.permissions.assigned", {
      role: savedRole,
      permissionIds,
      tenantId,
    });

    return savedRole;
  }

  async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[],
    tenantId: string,
  ): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);

    role.permissions = role.permissions.filter((p) => !permissionIds.includes(p.id));
    const savedRole = await this.roleRepository.save(role);

    this.eventEmitter.emit("role.permissions.removed", {
      role: savedRole,
      permissionIds,
      tenantId,
    });

    return savedRole;
  }

  // User-Role Management
  async assignRoleToUser(assignRoleDto: AssignRoleDto, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: assignRoleDto.userId, tenantId },
      relations: ["roles"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const role = await this.getRoleById(assignRoleDto.roleId, tenantId);

    // Check if user already has this role
    if (user.roles.some((r) => r.id === role.id)) {
      throw new BadRequestException("User already has this role");
    }

    user.roles.push(role);
    const savedUser = await this.userRepository.save(user);

    this.eventEmitter.emit("user.role.assigned", {
      user: savedUser,
      role,
      tenantId,
    });

    return savedUser;
  }

  async removeRoleFromUser(userId: string, roleId: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
      relations: ["roles"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.roles = user.roles.filter((r) => r.id !== roleId);
    const savedUser = await this.userRepository.save(user);

    this.eventEmitter.emit("user.role.removed", {
      user: savedUser,
      roleId,
      tenantId,
    });

    return savedUser;
  }

  async getUserRoles(userId: string, tenantId: string): Promise<Role[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
      relations: ["roles", "roles.permissions"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user.roles;
  }

  // Utility Methods
  async getRoleStats(tenantId: string): Promise<any> {
    const totalRoles = await this.roleRepository.count({ where: { tenantId } });
    const activeRoles = await this.roleRepository.count({ where: { tenantId, isActive: true } });
    const totalPermissions = await this.permissionRepository.count();
    const activePermissions = await this.permissionRepository.count({ where: { isActive: true } });

    return {
      totalRoles,
      activeRoles,
      inactiveRoles: totalRoles - activeRoles,
      totalPermissions,
      activePermissions,
      inactivePermissions: totalPermissions - activePermissions,
    };
  }
}
