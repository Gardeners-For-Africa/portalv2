import {
  BulkModuleUpdateRequest,
  DisableModuleRequest,
  EnableModuleRequest,
  ModuleFilters,
  ModuleStats,
  SYSTEM_MODULES,
  TenantModule,
  TenantModuleAssignment,
  TenantModulesConfig,
  TenantModulesResponse,
} from "@/types/tenant-modules";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class TenantModulesService {
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

  // ===== SYSTEM MODULES =====

  async getSystemModules(): Promise<TenantModule[]> {
    // For now, return the predefined system modules
    // In a real implementation, this would fetch from the API
    return Promise.resolve(SYSTEM_MODULES);
  }

  async getSystemModuleById(id: string): Promise<TenantModule | null> {
    const modules = await this.getSystemModules();
    return modules.find((module) => module.id === id) || null;
  }

  // ===== TENANT MODULE CONFIGURATION =====

  async getTenantModules(tenantId: string): Promise<TenantModulesResponse> {
    return this.request<TenantModulesResponse>(`/tenants/${tenantId}/modules`);
  }

  async getTenantModuleConfig(tenantId: string): Promise<TenantModulesConfig> {
    return this.request<TenantModulesConfig>(`/tenants/${tenantId}/modules/config`);
  }

  async enableModule(tenantId: string, data: EnableModuleRequest): Promise<TenantModuleAssignment> {
    return this.request<TenantModuleAssignment>(`/tenants/${tenantId}/modules/enable`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async disableModule(
    tenantId: string,
    data: DisableModuleRequest,
  ): Promise<TenantModuleAssignment> {
    return this.request<TenantModuleAssignment>(`/tenants/${tenantId}/modules/disable`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateModules(
    tenantId: string,
    data: BulkModuleUpdateRequest,
  ): Promise<TenantModuleAssignment[]> {
    return this.request<TenantModuleAssignment[]>(`/tenants/${tenantId}/modules/bulk`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ===== TENANT MODULE ASSIGNMENTS =====

  async getTenantModuleAssignments(
    tenantId: string,
    filters: ModuleFilters = {},
  ): Promise<{
    assignments: TenantModuleAssignment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();

    if (filters.category) params.append("category", filters.category);
    if (filters.isEnabled !== undefined) params.append("isEnabled", filters.isEnabled.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/tenants/${tenantId}/modules/assignments?${queryString}`
      : `/tenants/${tenantId}/modules/assignments`;

    return this.request(endpoint);
  }

  async getTenantModuleAssignment(
    tenantId: string,
    assignmentId: string,
  ): Promise<TenantModuleAssignment> {
    return this.request<TenantModuleAssignment>(
      `/tenants/${tenantId}/modules/assignments/${assignmentId}`,
    );
  }

  async updateTenantModuleAssignment(
    tenantId: string,
    assignmentId: string,
    data: Partial<TenantModuleAssignment>,
  ): Promise<TenantModuleAssignment> {
    return this.request<TenantModuleAssignment>(
      `/tenants/${tenantId}/modules/assignments/${assignmentId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  }

  // ===== STATISTICS AND ANALYTICS =====

  async getModuleStats(): Promise<ModuleStats> {
    return this.request<ModuleStats>("/modules/stats");
  }

  async getTenantModuleStats(tenantId: string): Promise<{
    totalModules: number;
    enabledModules: number;
    disabledModules: number;
    categoryBreakdown: Record<string, number>;
    recentChanges: Array<{
      moduleId: string;
      moduleName: string;
      action: "enabled" | "disabled";
      timestamp: string;
      updatedBy: string;
    }>;
  }> {
    return this.request(`/tenants/${tenantId}/modules/stats`);
  }

  // ===== EXPORT/IMPORT =====

  async exportTenantModules(tenantId: string): Promise<Blob> {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/modules/export`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  async importTenantModules(tenantId: string, file: File): Promise<TenantModulesConfig> {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/modules/import`, {
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

  async validateModuleConfiguration(
    tenantId: string,
    moduleIds: string[],
  ): Promise<{
    isValid: boolean;
    conflicts: Array<{
      moduleId: string;
      conflictType: "dependency" | "exclusion" | "limit";
      message: string;
    }>;
    suggestions: string[];
  }> {
    return this.request(`/tenants/${tenantId}/modules/validate`, {
      method: "POST",
      body: JSON.stringify({ moduleIds }),
    });
  }

  // ===== AUDIT LOGS =====

  async getModuleAuditLogs(
    tenantId: string,
    filters: {
      moduleId?: string;
      action?: "enabled" | "disabled" | "updated";
      userId?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{
    logs: Array<{
      id: string;
      moduleId: string;
      moduleName: string;
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

    if (filters.moduleId) params.append("moduleId", filters.moduleId);
    if (filters.action) params.append("action", filters.action);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/tenants/${tenantId}/modules/audit-logs?${queryString}`
      : `/tenants/${tenantId}/modules/audit-logs`;

    return this.request(endpoint);
  }

  // ===== HELPER METHODS =====

  async getAvailableModulesForTenant(tenantId: string): Promise<TenantModule[]> {
    const systemModules = await this.getSystemModules();
    const tenantConfig = await this.getTenantModuleConfig(tenantId);

    return systemModules.filter(
      (module) =>
        !tenantConfig.enabledModules.some(
          (assignment) => assignment.moduleId === module.id && assignment.isEnabled,
        ),
    );
  }

  async getEnabledModulesForTenant(tenantId: string): Promise<TenantModuleAssignment[]> {
    const config = await this.getTenantModuleConfig(tenantId);
    return config.enabledModules.filter((assignment) => assignment.isEnabled);
  }

  async getModuleDependencies(moduleId: string): Promise<string[]> {
    // This would typically come from the API, but for now we'll define some basic dependencies
    const dependencies: Record<string, string[]> = {
      grades: ["user_management", "classroom_management"],
      exams: ["grades", "user_management"],
      payments: ["user_management"],
      library: ["user_management"],
      transport: ["user_management"],
      hostels: ["user_management"],
      reports: ["grades", "payments", "user_management"],
    };

    return dependencies[moduleId] || [];
  }
}

export const tenantModulesService = new TenantModulesService();
