import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserType } from "../../../database/entities/user.entity";
import { Roles } from "../../../shared/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../shared/auth/guards/roles.guard";
import {
  AssignPermissionsDto,
  AssignRoleDto,
  CreatePermissionDto,
  CreateRoleDto,
  PermissionResponseDto,
  RbacStatsDto,
  RoleResponseDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from "./dto/rbac.dto";
import { RbacService } from "./rbac.service";

@ApiTags("RBAC Management")
@Controller("rbac")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserType.SUPER_ADMIN)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // Role Management
  @Post("roles")
  @ApiOperation({ summary: "Create a new role" })
  @ApiResponse({ status: 201, description: "Role created successfully", type: RoleResponseDto })
  @ApiResponse({ status: 400, description: "Bad request" })
  async createRole(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    return this.rbacService.createRole(createRoleDto, req.user.tenantId);
  }

  @Get("roles")
  @ApiOperation({ summary: "Get all roles" })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({ status: 200, description: "Roles retrieved successfully" })
  async getRoles(@Query() filters: any, @Request() req) {
    return this.rbacService.getRoles(req.user.tenantId, filters);
  }

  @Get("roles/:id")
  @ApiOperation({ summary: "Get role by ID" })
  @ApiResponse({ status: 200, description: "Role retrieved successfully", type: RoleResponseDto })
  @ApiResponse({ status: 404, description: "Role not found" })
  async getRoleById(@Param("id") id: string, @Request() req) {
    return this.rbacService.getRoleById(id, req.user.tenantId);
  }

  @Put("roles/:id")
  @ApiOperation({ summary: "Update role" })
  @ApiResponse({ status: 200, description: "Role updated successfully", type: RoleResponseDto })
  @ApiResponse({ status: 404, description: "Role not found" })
  async updateRole(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto, @Request() req) {
    return this.rbacService.updateRole(id, updateRoleDto, req.user.tenantId);
  }

  @Delete("roles/:id")
  @ApiOperation({ summary: "Delete role" })
  @ApiResponse({ status: 200, description: "Role deleted successfully" })
  @ApiResponse({ status: 404, description: "Role not found" })
  @ApiResponse({ status: 400, description: "Cannot delete role assigned to users" })
  async deleteRole(@Param("id") id: string, @Request() req) {
    await this.rbacService.deleteRole(id, req.user.tenantId);
    return { message: "Role deleted successfully" };
  }

  // Permission Management
  @Post("permissions")
  @ApiOperation({ summary: "Create a new permission" })
  @ApiResponse({
    status: 201,
    description: "Permission created successfully",
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  @Get("permissions")
  @ApiOperation({ summary: "Get all permissions" })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiQuery({ name: "category", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({ status: 200, description: "Permissions retrieved successfully" })
  async getPermissions(@Query() filters: any) {
    return this.rbacService.getPermissions(filters);
  }

  @Get("permissions/:id")
  @ApiOperation({ summary: "Get permission by ID" })
  @ApiResponse({
    status: 200,
    description: "Permission retrieved successfully",
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: "Permission not found" })
  async getPermissionById(@Param("id") id: string) {
    return this.rbacService.getPermissionById(id);
  }

  @Put("permissions/:id")
  @ApiOperation({ summary: "Update permission" })
  @ApiResponse({
    status: 200,
    description: "Permission updated successfully",
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: "Permission not found" })
  async updatePermission(
    @Param("id") id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.rbacService.updatePermission(id, updatePermissionDto);
  }

  @Delete("permissions/:id")
  @ApiOperation({ summary: "Delete permission" })
  @ApiResponse({ status: 200, description: "Permission deleted successfully" })
  @ApiResponse({ status: 404, description: "Permission not found" })
  @ApiResponse({ status: 400, description: "Cannot delete permission assigned to roles" })
  async deletePermission(@Param("id") id: string) {
    await this.rbacService.deletePermission(id);
    return { message: "Permission deleted successfully" };
  }

  // Role-Permission Management
  @Post("roles/:roleId/permissions")
  @ApiOperation({ summary: "Assign permissions to role" })
  @ApiResponse({
    status: 200,
    description: "Permissions assigned successfully",
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: "Role not found" })
  @ApiResponse({ status: 400, description: "Invalid permission IDs" })
  async assignPermissionsToRole(
    @Param("roleId") roleId: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
    @Request() req,
  ) {
    return this.rbacService.assignPermissionsToRole(
      roleId,
      assignPermissionsDto.permissionIds,
      req.user.tenantId,
    );
  }

  @Delete("roles/:roleId/permissions")
  @ApiOperation({ summary: "Remove permissions from role" })
  @ApiResponse({
    status: 200,
    description: "Permissions removed successfully",
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: "Role not found" })
  async removePermissionsFromRole(
    @Param("roleId") roleId: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
    @Request() req,
  ) {
    return this.rbacService.removePermissionsFromRole(
      roleId,
      assignPermissionsDto.permissionIds,
      req.user.tenantId,
    );
  }

  // User-Role Management
  @Post("users/assign-role")
  @ApiOperation({ summary: "Assign role to user" })
  @ApiResponse({ status: 200, description: "Role assigned successfully" })
  @ApiResponse({ status: 404, description: "User or role not found" })
  @ApiResponse({ status: 400, description: "User already has this role" })
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto, @Request() req) {
    return this.rbacService.assignRoleToUser(assignRoleDto, req.user.tenantId);
  }

  @Delete("users/:userId/roles/:roleId")
  @ApiOperation({ summary: "Remove role from user" })
  @ApiResponse({ status: 200, description: "Role removed successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async removeRoleFromUser(
    @Param("userId") userId: string,
    @Param("roleId") roleId: string,
    @Request() req,
  ) {
    return this.rbacService.removeRoleFromUser(userId, roleId, req.user.tenantId);
  }

  @Get("users/:userId/roles")
  @ApiOperation({ summary: "Get user roles" })
  @ApiResponse({ status: 200, description: "User roles retrieved successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserRoles(@Param("userId") userId: string, @Request() req) {
    return this.rbacService.getUserRoles(userId, req.user.tenantId);
  }

  // Statistics
  @Get("stats")
  @ApiOperation({ summary: "Get RBAC statistics" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
    type: RbacStatsDto,
  })
  async getStats(@Request() req) {
    return this.rbacService.getRoleStats(req.user.tenantId);
  }
}
