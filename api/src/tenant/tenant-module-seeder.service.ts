import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ModuleCategory, TenantModule } from "../database/entities/tenant-module.entity";

@Injectable()
export class TenantModuleSeederService {
  constructor(
    @InjectRepository(TenantModule)
    private readonly tenantModuleRepository: Repository<TenantModule>,
  ) {}

  async seedSystemModules(): Promise<void> {
    const systemModules = [
      {
        code: "GRADES",
        name: "Grades Management",
        description: "Manage student grades, exams, and academic records",
        icon: "GraduationCap",
        category: ModuleCategory.ACADEMIC,
        order: 1,
        permissions: ["grades:read", "grades:write", "grades:manage"],
        dependencies: ["user_management", "classroom_management"],
        exclusions: [],
      },
      {
        code: "EXAMS",
        name: "Exams Management",
        description: "Schedule and manage examinations",
        icon: "FileText",
        category: ModuleCategory.ACADEMIC,
        order: 2,
        permissions: ["exams:read", "exams:write", "exams:manage"],
        dependencies: ["grades", "user_management"],
        exclusions: [],
      },
      {
        code: "PAYMENTS",
        name: "Payments Management",
        description: "Manage school fees and payment processing",
        icon: "CreditCard",
        category: ModuleCategory.FINANCIAL,
        order: 3,
        permissions: ["payments:read", "payments:write", "payments:manage"],
        dependencies: ["user_management"],
        exclusions: [],
      },
      {
        code: "USER_MGMT",
        name: "User Management",
        description: "Manage students, teachers, and staff accounts",
        icon: "Users",
        category: ModuleCategory.ADMINISTRATIVE,
        order: 4,
        permissions: ["users:read", "users:write", "users:manage"],
        dependencies: [],
        exclusions: [],
      },
      {
        code: "CLASSROOM",
        name: "Classroom Management",
        description: "Manage classes, subjects, and schedules",
        icon: "BookOpen",
        category: ModuleCategory.ACADEMIC,
        order: 5,
        permissions: ["classes:read", "classes:write", "classes:manage"],
        dependencies: ["user_management"],
        exclusions: [],
      },
      {
        code: "HOSTELS",
        name: "Hostel Management",
        description: "Manage student accommodations and hostel assignments",
        icon: "Building",
        category: ModuleCategory.STUDENT_LIFE,
        order: 6,
        permissions: ["hostels:read", "hostels:write", "hostels:manage"],
        dependencies: ["user_management"],
        exclusions: [],
      },
      {
        code: "REPORTS",
        name: "Reports & Analytics",
        description: "Generate reports and view analytics",
        icon: "BarChart3",
        category: ModuleCategory.REPORTING,
        order: 7,
        permissions: ["reports:read", "reports:generate"],
        dependencies: ["grades", "payments", "user_management"],
        exclusions: [],
      },
      {
        code: "NOTIFICATIONS",
        name: "Notifications",
        description: "Send and manage notifications to users",
        icon: "Bell",
        category: ModuleCategory.COMMUNICATION,
        order: 8,
        permissions: ["notifications:read", "notifications:send"],
        dependencies: ["user_management"],
        exclusions: [],
      },
      {
        code: "LIBRARY",
        name: "Library Management",
        description: "Manage library resources and book lending",
        icon: "Library",
        category: ModuleCategory.ACADEMIC,
        order: 9,
        permissions: ["library:read", "library:write", "library:manage"],
        dependencies: ["user_management"],
        exclusions: [],
      },
      {
        code: "TRANSPORT",
        name: "Transport Management",
        description: "Manage school transportation and routes",
        icon: "Bus",
        category: ModuleCategory.STUDENT_LIFE,
        order: 10,
        permissions: ["transport:read", "transport:write", "transport:manage"],
        dependencies: ["user_management"],
        exclusions: [],
      },
      {
        code: "ATTENDANCE",
        name: "Attendance Management",
        description: "Track student and staff attendance",
        icon: "Calendar",
        category: ModuleCategory.ADMINISTRATIVE,
        order: 11,
        permissions: ["attendance:read", "attendance:write", "attendance:manage"],
        dependencies: ["user_management", "classroom_management"],
        exclusions: [],
      },
      {
        code: "INVENTORY",
        name: "Inventory Management",
        description: "Manage school equipment and supplies",
        icon: "Package",
        category: ModuleCategory.ADMINISTRATIVE,
        order: 12,
        permissions: ["inventory:read", "inventory:write", "inventory:manage"],
        dependencies: ["user_management"],
        exclusions: [],
      },
      {
        code: "TIMETABLE",
        name: "Timetable Management",
        description: "Create and manage class schedules",
        icon: "Clock",
        category: ModuleCategory.ACADEMIC,
        order: 13,
        permissions: ["timetable:read", "timetable:write", "timetable:manage"],
        dependencies: ["classroom_management", "user_management"],
        exclusions: [],
      },
      {
        code: "PARENT_PORTAL",
        name: "Parent Portal",
        description: "Portal for parents to view student information",
        icon: "UserCheck",
        category: ModuleCategory.COMMUNICATION,
        order: 14,
        permissions: ["parent:read", "parent:view"],
        dependencies: ["user_management", "grades"],
        exclusions: [],
      },
      {
        code: "STAFF_MGMT",
        name: "Staff Management",
        description: "Manage staff records and payroll",
        icon: "Briefcase",
        category: ModuleCategory.HUMAN_RESOURCES,
        order: 15,
        permissions: ["staff:read", "staff:write", "staff:manage"],
        dependencies: ["user_management"],
        exclusions: [],
      },
    ];

    for (const moduleData of systemModules) {
      const existingModule = await this.tenantModuleRepository.findOne({
        where: { code: moduleData.code },
      });

      if (!existingModule) {
        const module = this.tenantModuleRepository.create({
          ...moduleData,
          isSystemModule: true,
          isActive: true,
        });

        await this.tenantModuleRepository.save(module);
        console.log(`Created system module: ${moduleData.name}`);
      } else {
        // Update existing module
        Object.assign(existingModule, {
          name: moduleData.name,
          description: moduleData.description,
          icon: moduleData.icon,
          category: moduleData.category,
          order: moduleData.order,
          permissions: moduleData.permissions,
          dependencies: moduleData.dependencies,
          exclusions: moduleData.exclusions,
        });

        await this.tenantModuleRepository.save(existingModule);
        console.log(`Updated system module: ${moduleData.name}`);
      }
    }

    console.log("System modules seeding completed");
  }

  async clearSystemModules(): Promise<void> {
    await this.tenantModuleRepository.delete({ isSystemModule: true });
    console.log("System modules cleared");
  }

  async getSystemModulesCount(): Promise<number> {
    return this.tenantModuleRepository.count({ where: { isSystemModule: true } });
  }
}
