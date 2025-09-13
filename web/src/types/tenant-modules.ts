// Tenant Modules Types for School Management System

export interface TenantModule {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: ModuleCategory;
  isSystemModule: boolean;
  isActive: boolean;
  order: number;
  permissions: string[]; // Array of permission codes required for this module
  createdAt: string;
  updatedAt: string;
}

export type ModuleCategory =
  | "academic"
  | "financial"
  | "administrative"
  | "communication"
  | "reporting"
  | "system"
  | "student_life"
  | "human_resources";

export interface TenantModuleAssignment {
  id: string;
  tenantId: string;
  tenantName: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  isEnabled: boolean;
  enabledAt?: string;
  enabledBy: string;
  enabledByName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantModulesConfig {
  id: string;
  tenantId: string;
  tenantName: string;
  enabledModules: TenantModuleAssignment[];
  totalModules: number;
  enabledCount: number;
  lastUpdated: string;
  updatedBy: string;
  updatedByName: string;
  createdAt: string;
  updatedAt: string;
}

// Predefined system modules
export const SYSTEM_MODULES: TenantModule[] = [
  {
    id: "grades",
    code: "GRADES",
    name: "Grades Management",
    description: "Manage student grades, exams, and academic records",
    icon: "GraduationCap",
    category: "academic",
    isSystemModule: true,
    isActive: true,
    order: 1,
    permissions: ["grades:read", "grades:write", "grades:manage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "exams",
    code: "EXAMS",
    name: "Exams Management",
    description: "Schedule and manage examinations",
    icon: "FileText",
    category: "academic",
    isSystemModule: true,
    isActive: true,
    order: 2,
    permissions: ["exams:read", "exams:write", "exams:manage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "payments",
    code: "PAYMENTS",
    name: "Payments Management",
    description: "Manage school fees and payment processing",
    icon: "CreditCard",
    category: "financial",
    isSystemModule: true,
    isActive: true,
    order: 3,
    permissions: ["payments:read", "payments:write", "payments:manage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user_management",
    code: "USER_MGMT",
    name: "User Management",
    description: "Manage students, teachers, and staff accounts",
    icon: "Users",
    category: "administrative",
    isSystemModule: true,
    isActive: true,
    order: 4,
    permissions: ["users:read", "users:write", "users:manage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "classroom_management",
    code: "CLASSROOM",
    name: "Classroom Management",
    description: "Manage classes, subjects, and schedules",
    icon: "BookOpen",
    category: "academic",
    isSystemModule: true,
    isActive: true,
    order: 5,
    permissions: ["classes:read", "classes:write", "classes:manage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "hostels",
    code: "HOSTELS",
    name: "Hostel Management",
    description: "Manage student accommodations and hostel assignments",
    icon: "Building",
    category: "student_life",
    isSystemModule: true,
    isActive: true,
    order: 6,
    permissions: ["hostels:read", "hostels:write", "hostels:manage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "reports",
    code: "REPORTS",
    name: "Reports & Analytics",
    description: "Generate reports and view analytics",
    icon: "BarChart3",
    category: "reporting",
    isSystemModule: true,
    isActive: true,
    order: 7,
    permissions: ["reports:read", "reports:generate"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "notifications",
    code: "NOTIFICATIONS",
    name: "Notifications",
    description: "Send and manage notifications to users",
    icon: "Bell",
    category: "communication",
    isSystemModule: true,
    isActive: true,
    order: 8,
    permissions: ["notifications:read", "notifications:send"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "library",
    code: "LIBRARY",
    name: "Library Management",
    description: "Manage library resources and book lending",
    icon: "Library",
    category: "academic",
    isSystemModule: true,
    isActive: true,
    order: 9,
    permissions: ["library:read", "library:write", "library:manage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "transport",
    code: "TRANSPORT",
    name: "Transport Management",
    description: "Manage school transportation and routes",
    icon: "Bus",
    category: "student_life",
    isSystemModule: true,
    isActive: true,
    order: 10,
    permissions: ["transport:read", "transport:write", "transport:manage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// API Request/Response Types
export interface EnableModuleRequest {
  moduleId: string;
  notes?: string;
}

export interface DisableModuleRequest {
  moduleId: string;
  reason?: string;
}

export interface BulkModuleUpdateRequest {
  moduleIds: string[];
  enabled: boolean;
  notes?: string;
}

export interface TenantModulesResponse {
  tenantId: string;
  tenantName: string;
  config: TenantModulesConfig;
  availableModules: TenantModule[];
  stats: {
    totalModules: number;
    enabledModules: number;
    disabledModules: number;
    categoryBreakdown: Record<ModuleCategory, number>;
  };
}

// Filter Types
export interface ModuleFilters {
  category?: ModuleCategory;
  isEnabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Statistics Types
export interface ModuleStats {
  totalModules: number;
  enabledModules: number;
  disabledModules: number;
  mostUsedModules: Array<{
    moduleId: string;
    moduleName: string;
    tenantCount: number;
  }>;
  categoryBreakdown: Record<ModuleCategory, number>;
  recentChanges: Array<{
    tenantId: string;
    tenantName: string;
    moduleId: string;
    moduleName: string;
    action: "enabled" | "disabled";
    timestamp: string;
    updatedBy: string;
  }>;
}
