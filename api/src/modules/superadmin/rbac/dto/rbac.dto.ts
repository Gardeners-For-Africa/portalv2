import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreateRoleDto {
  @ApiProperty({ description: "Role name", example: "teacher" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: "Role description",
    example: "Teacher role with access to student management",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: "Whether the role is active", example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Role metadata", example: { level: 3, color: "#3B82F6" } })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: "Role name", example: "senior_teacher" })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: "Role description",
    example: "Senior teacher with additional privileges",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: "Whether the role is active", example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Role metadata", example: { level: 2, color: "#10B981" } })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreatePermissionDto {
  @ApiProperty({ description: "Permission name", example: "student:read" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: "Permission description",
    example: "View student information",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: "Resource name", example: "student" })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  resource?: string;

  @ApiPropertyOptional({ description: "Action name", example: "read" })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  action?: string;

  @ApiPropertyOptional({
    description: "Whether the permission is active",
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Permission metadata",
    example: { category: "student_management", level: 1 },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: "Permission name", example: "student:view" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: "Permission description",
    example: "View student information and profiles",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: "Resource name", example: "student" })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  resource?: string;

  @ApiPropertyOptional({ description: "Action name", example: "view" })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  action?: string;

  @ApiPropertyOptional({ description: "Whether the permission is active", example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Permission metadata",
    example: { category: "student_management", level: 1 },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AssignRoleDto {
  @ApiProperty({ description: "User ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: "Role ID", example: "123e4567-e89b-12d3-a456-426614174001" })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}

export class AssignPermissionsDto {
  @ApiProperty({
    description: "Array of permission IDs",
    example: ["123e4567-e89b-12d3-a456-426614174000"],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsNotEmpty()
  permissionIds: string[];
}

export class RoleResponseDto {
  @ApiProperty({ description: "Role ID" })
  id: string;

  @ApiProperty({ description: "Role name" })
  name: string;

  @ApiPropertyOptional({ description: "Role description" })
  description?: string;

  @ApiProperty({ description: "Whether the role is active" })
  isActive: boolean;

  @ApiPropertyOptional({ description: "Role metadata" })
  metadata?: Record<string, any>;

  @ApiProperty({ description: "Tenant ID" })
  tenantId: string;

  @ApiProperty({ description: "Creation date" })
  createdAt: Date;

  @ApiProperty({ description: "Last update date" })
  updatedAt: Date;

  @ApiPropertyOptional({ description: "Role permissions" })
  permissions?: any[];

  @ApiPropertyOptional({ description: "Users with this role" })
  users?: any[];
}

export class PermissionResponseDto {
  @ApiProperty({ description: "Permission ID" })
  id: string;

  @ApiProperty({ description: "Permission name" })
  name: string;

  @ApiPropertyOptional({ description: "Permission description" })
  description?: string;

  @ApiPropertyOptional({ description: "Resource name" })
  resource?: string;

  @ApiPropertyOptional({ description: "Action name" })
  action?: string;

  @ApiProperty({ description: "Whether the permission is active" })
  isActive: boolean;

  @ApiPropertyOptional({ description: "Permission metadata" })
  metadata?: Record<string, any>;

  @ApiProperty({ description: "Creation date" })
  createdAt: Date;

  @ApiProperty({ description: "Last update date" })
  updatedAt: Date;

  @ApiPropertyOptional({ description: "Roles with this permission" })
  roles?: any[];
}

export class RbacStatsDto {
  @ApiProperty({ description: "Total number of roles" })
  totalRoles: number;

  @ApiProperty({ description: "Number of active roles" })
  activeRoles: number;

  @ApiProperty({ description: "Number of inactive roles" })
  inactiveRoles: number;

  @ApiProperty({ description: "Total number of permissions" })
  totalPermissions: number;

  @ApiProperty({ description: "Number of active permissions" })
  activePermissions: number;

  @ApiProperty({ description: "Number of inactive permissions" })
  inactivePermissions: number;
}
