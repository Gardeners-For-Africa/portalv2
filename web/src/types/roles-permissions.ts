// Roles and Permissions Types for School Management System

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  action: PermissionAction;
  resource: string;
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "view"
  | "export"
  | "import"
  | "approve"
  | "reject";

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  schoolId: string;
  schoolName: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: Permission[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  code: string;
  description: string;
  icon?: string;
  category: ModuleCategory;
  isActive: boolean;
  isSystemModule: boolean;
  permissions: Permission[];
  schoolId: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
}

export type ModuleCategory =
  | "academic"
  | "financial"
  | "administrative"
  | "communication"
  | "reporting"
  | "system";

export interface UserRole {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  schoolId: string;
  schoolName: string;
  isActive: boolean;
  assignedAt: string;
  assignedBy: string;
  assignedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  isGranted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolSettings {
  id: string;
  schoolId: string;
  schoolName: string;
  availableRoles: Role[];
  availableModules: Module[];
  userRoles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface CreateRoleRequest {
  name: string;
  code: string;
  description: string;
  schoolId: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  code?: string;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

export interface CreateModuleRequest {
  name: string;
  code: string;
  description: string;
  category: ModuleCategory;
  schoolId: string;
  permissionIds: string[];
  icon?: string;
}

export interface UpdateModuleRequest {
  name?: string;
  code?: string;
  description?: string;
  category?: ModuleCategory;
  permissionIds?: string[];
  icon?: string;
  isActive?: boolean;
}

export interface AssignUserRoleRequest {
  userId: string;
  roleId: string;
  schoolId: string;
}

export interface UpdateUserRoleRequest {
  roleId?: string;
  isActive?: boolean;
}

export interface RoleListResponse {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModuleListResponse {
  modules: Module[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserRoleListResponse {
  userRoles: UserRole[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PermissionListResponse {
  permissions: Permission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SchoolSettingsResponse {
  settings: SchoolSettings;
  stats: {
    totalRoles: number;
    totalModules: number;
    totalUsers: number;
    activeUsers: number;
  };
}

// Filter Types
export interface RoleFilters {
  schoolId?: string;
  search?: string;
  isActive?: boolean;
  isSystemRole?: boolean;
  page?: number;
  limit?: number;
}

export interface ModuleFilters {
  schoolId?: string;
  search?: string;
  category?: ModuleCategory;
  isActive?: boolean;
  isSystemModule?: boolean;
  page?: number;
  limit?: number;
}

export interface UserRoleFilters {
  schoolId?: string;
  userId?: string;
  roleId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PermissionFilters {
  module?: string;
  action?: PermissionAction;
  resource?: string;
  isSystemPermission?: boolean;
  page?: number;
  limit?: number;
}

// Form Types
export interface RoleFormData {
  name: string;
  code: string;
  description: string;
  permissionIds: string[];
}

export interface ModuleFormData {
  name: string;
  code: string;
  description: string;
  category: ModuleCategory;
  permissionIds: string[];
  icon?: string;
}

export interface UserRoleFormData {
  userId: string;
  roleId: string;
}

// Statistics Types
export interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  rolesWithUsers: number;
  averageUsersPerRole: number;
}

export interface ModuleStats {
  totalModules: number;
  activeModules: number;
  systemModules: number;
  customModules: number;
  modulesByCategory: Record<ModuleCategory, number>;
}

export interface UserRoleStats {
  totalUserRoles: number;
  activeUserRoles: number;
  usersByRole: Record<string, number>;
  rolesByUser: Record<string, number>;
}
