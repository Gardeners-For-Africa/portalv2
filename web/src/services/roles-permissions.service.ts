import {
  AssignUserRoleRequest,
  CreateModuleRequest,
  CreateRoleRequest,
  Module,
  ModuleFilters,
  ModuleFormData,
  ModuleListResponse,
  ModuleStats,
  Permission,
  PermissionFilters,
  PermissionListResponse,
  Role,
  RoleFilters,
  RoleFormData,
  RoleListResponse,
  RoleStats,
  SchoolSettings,
  SchoolSettingsResponse,
  UpdateModuleRequest,
  UpdateRoleRequest,
  UpdateUserRoleRequest,
  UserRole,
  UserRoleFilters,
  UserRoleFormData,
  UserRoleListResponse,
  UserRoleStats,
} from "@/types/roles-permissions";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class RolesPermissionsService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("authToken");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ===== ROLES =====

  async getRoles(filters: RoleFilters = {}): Promise<RoleListResponse> {
    const params = new URLSearchParams();

    if (filters.schoolId) params.append("schoolId", filters.schoolId);
    if (filters.search) params.append("search", filters.search);
    if (filters.isActive !== undefined) params.append("isActive", filters.isActive.toString());
    if (filters.isSystemRole !== undefined)
      params.append("isSystemRole", filters.isSystemRole.toString());
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/roles?${queryString}` : "/roles";

    return this.request<RoleListResponse>(endpoint);
  }

  async getRoleById(id: string): Promise<Role> {
    return this.request<Role>(`/roles/${id}`);
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return this.request<Role>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    return this.request<Role>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<void> {
    return this.request<void>(`/roles/${id}`, {
      method: "DELETE",
    });
  }

  async getRoleStats(schoolId?: string): Promise<RoleStats> {
    const params = new URLSearchParams();
    if (schoolId) params.append("schoolId", schoolId);

    const queryString = params.toString();
    const endpoint = queryString ? `/roles/stats?${queryString}` : "/roles/stats";

    return this.request<RoleStats>(endpoint);
  }

  // ===== MODULES =====

  async getModules(filters: ModuleFilters = {}): Promise<ModuleListResponse> {
    const params = new URLSearchParams();

    if (filters.schoolId) params.append("schoolId", filters.schoolId);
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.isActive !== undefined) params.append("isActive", filters.isActive.toString());
    if (filters.isSystemModule !== undefined)
      params.append("isSystemModule", filters.isSystemModule.toString());
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/modules?${queryString}` : "/modules";

    return this.request<ModuleListResponse>(endpoint);
  }

  async getModuleById(id: string): Promise<Module> {
    return this.request<Module>(`/modules/${id}`);
  }

  async createModule(data: CreateModuleRequest): Promise<Module> {
    return this.request<Module>("/modules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateModule(id: string, data: UpdateModuleRequest): Promise<Module> {
    return this.request<Module>(`/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteModule(id: string): Promise<void> {
    return this.request<void>(`/modules/${id}`, {
      method: "DELETE",
    });
  }

  async getModuleStats(schoolId?: string): Promise<ModuleStats> {
    const params = new URLSearchParams();
    if (schoolId) params.append("schoolId", schoolId);

    const queryString = params.toString();
    const endpoint = queryString ? `/modules/stats?${queryString}` : "/modules/stats";

    return this.request<ModuleStats>(endpoint);
  }

  // ===== PERMISSIONS =====

  async getPermissions(filters: PermissionFilters = {}): Promise<PermissionListResponse> {
    const params = new URLSearchParams();

    if (filters.module) params.append("module", filters.module);
    if (filters.action) params.append("action", filters.action);
    if (filters.resource) params.append("resource", filters.resource);
    if (filters.isSystemPermission !== undefined)
      params.append("isSystemPermission", filters.isSystemPermission.toString());
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/permissions?${queryString}` : "/permissions";

    return this.request<PermissionListResponse>(endpoint);
  }

  async getPermissionById(id: string): Promise<Permission> {
    return this.request<Permission>(`/permissions/${id}`);
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return this.request<Permission[]>(`/permissions/module/${module}`);
  }

  // ===== USER ROLES =====

  async getUserRoles(filters: UserRoleFilters = {}): Promise<UserRoleListResponse> {
    const params = new URLSearchParams();

    if (filters.schoolId) params.append("schoolId", filters.schoolId);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.roleId) params.append("roleId", filters.roleId);
    if (filters.search) params.append("search", filters.search);
    if (filters.isActive !== undefined) params.append("isActive", filters.isActive.toString());
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/user-roles?${queryString}` : "/user-roles";

    return this.request<UserRoleListResponse>(endpoint);
  }

  async getUserRoleById(id: string): Promise<UserRole> {
    return this.request<UserRole>(`/user-roles/${id}`);
  }

  async assignUserRole(data: AssignUserRoleRequest): Promise<UserRole> {
    return this.request<UserRole>("/user-roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<UserRole> {
    return this.request<UserRole>(`/user-roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async removeUserRole(id: string): Promise<void> {
    return this.request<void>(`/user-roles/${id}`, {
      method: "DELETE",
    });
  }

  async getUserRoleStats(schoolId?: string): Promise<UserRoleStats> {
    const params = new URLSearchParams();
    if (schoolId) params.append("schoolId", schoolId);

    const queryString = params.toString();
    const endpoint = queryString ? `/user-roles/stats?${queryString}` : "/user-roles/stats";

    return this.request<UserRoleStats>(endpoint);
  }

  // ===== SCHOOL SETTINGS =====

  async getSchoolSettings(schoolId: string): Promise<SchoolSettingsResponse> {
    return this.request<SchoolSettingsResponse>(`/schools/${schoolId}/settings`);
  }

  async updateSchoolSettings(
    schoolId: string,
    data: Partial<SchoolSettings>,
  ): Promise<SchoolSettings> {
    return this.request<SchoolSettings>(`/schools/${schoolId}/settings`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ===== BULK OPERATIONS =====

  async bulkAssignUserRoles(assignments: AssignUserRoleRequest[]): Promise<UserRole[]> {
    return this.request<UserRole[]>("/user-roles/bulk", {
      method: "POST",
      body: JSON.stringify({ assignments }),
    });
  }

  async bulkUpdateUserRoles(
    updates: { id: string; data: UpdateUserRoleRequest }[],
  ): Promise<UserRole[]> {
    return this.request<UserRole[]>("/user-roles/bulk", {
      method: "PUT",
      body: JSON.stringify({ updates }),
    });
  }

  async bulkDeleteUserRoles(ids: string[]): Promise<void> {
    return this.request<void>("/user-roles/bulk", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  }

  // ===== EXPORT/IMPORT =====

  async exportSchoolSettings(schoolId: string): Promise<Blob> {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/schools/${schoolId}/settings/export`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  async importSchoolSettings(schoolId: string, file: File): Promise<SchoolSettings> {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/schools/${schoolId}/settings/import`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Import failed: ${response.status}`);
    }

    return response.json();
  }

  // ===== VALIDATION =====

  async validateRoleCode(
    code: string,
    schoolId: string,
    excludeId?: string,
  ): Promise<{ isValid: boolean; message?: string }> {
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("schoolId", schoolId);
    if (excludeId) params.append("excludeId", excludeId);

    return this.request<{ isValid: boolean; message?: string }>(
      `/roles/validate-code?${params.toString()}`,
    );
  }

  async validateModuleCode(
    code: string,
    schoolId: string,
    excludeId?: string,
  ): Promise<{ isValid: boolean; message?: string }> {
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("schoolId", schoolId);
    if (excludeId) params.append("excludeId", excludeId);

    return this.request<{ isValid: boolean; message?: string }>(
      `/modules/validate-code?${params.toString()}`,
    );
  }

  // ===== AUDIT LOGS =====

  async getAuditLogs(
    schoolId: string,
    filters: {
      entityType?: "role" | "module" | "user_role" | "permission";
      entityId?: string;
      action?: "create" | "update" | "delete" | "assign" | "remove";
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{
    logs: Array<{
      id: string;
      entityType: string;
      entityId: string;
      action: string;
      userId: string;
      userName: string;
      changes: Record<string, any>;
      timestamp: string;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();

    if (filters.entityType) params.append("entityType", filters.entityType);
    if (filters.entityId) params.append("entityId", filters.entityId);
    if (filters.action) params.append("action", filters.action);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/schools/${schoolId}/audit-logs?${queryString}`
      : `/schools/${schoolId}/audit-logs`;

    return this.request(endpoint);
  }
}

export const rolesPermissionsService = new RolesPermissionsService();
