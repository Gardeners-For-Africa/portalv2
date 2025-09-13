import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ModuleCategory, TenantModule } from "../database/entities/tenant-module.entity";
import { TenantModuleSeederService } from "./tenant-module-seeder.service";

describe("TenantModuleSeederService", () => {
  let service: TenantModuleSeederService;
  let tenantModuleRepository: Repository<TenantModule>;

  const mockTenantModule = {
    id: "module-123",
    code: "GRADES",
    name: "Grades Management",
    description: "Manage student grades, exams, and academic records",
    icon: "GraduationCap",
    category: ModuleCategory.ACADEMIC,
    isSystemModule: true,
    isActive: true,
    order: 1,
    permissions: ["grades:read", "grades:write", "grades:manage"],
    dependencies: ["user_management", "classroom_management"],
    exclusions: [],
    configurationSchema: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockTenantModuleRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantModuleSeederService,
        {
          provide: getRepositoryToken(TenantModule),
          useValue: mockTenantModuleRepository,
        },
      ],
    }).compile();

    service = module.get<TenantModuleSeederService>(TenantModuleSeederService);
    tenantModuleRepository = module.get<Repository<TenantModule>>(getRepositoryToken(TenantModule));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("seedSystemModules", () => {
    it("should seed all system modules when none exist", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Mock that no modules exist initially
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockReturnValue(mockTenantModule as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(mockTenantModule as any);

      await service.seedSystemModules();

      // Should attempt to create 15 system modules
      expect(tenantModuleRepository.findOne).toHaveBeenCalledTimes(15);
      expect(tenantModuleRepository.create).toHaveBeenCalledTimes(15);
      expect(tenantModuleRepository.save).toHaveBeenCalledTimes(15);

      // Verify console logs
      expect(consoleSpy).toHaveBeenCalledWith("Created system module: Grades Management");
      expect(consoleSpy).toHaveBeenCalledWith("System modules seeding completed");

      consoleSpy.mockRestore();
    });

    it("should update existing modules when they already exist", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Mock that modules already exist
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(mockTenantModule as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(mockTenantModule as any);

      await service.seedSystemModules();

      // Should find existing modules and update them
      expect(tenantModuleRepository.findOne).toHaveBeenCalledTimes(15);
      expect(tenantModuleRepository.create).not.toHaveBeenCalled();
      expect(tenantModuleRepository.save).toHaveBeenCalledTimes(15);

      // Verify console logs
      expect(consoleSpy).toHaveBeenCalledWith("Updated system module: Grades Management");
      expect(consoleSpy).toHaveBeenCalledWith("System modules seeding completed");

      consoleSpy.mockRestore();
    });

    it("should create modules with correct properties", async () => {
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockImplementation((data) => data as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(mockTenantModule as any);

      await service.seedSystemModules();

      // Verify the first module (Grades) was created with correct properties
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "GRADES",
          name: "Grades Management",
          description: "Manage student grades, exams, and academic records",
          icon: "GraduationCap",
          category: ModuleCategory.ACADEMIC,
          isSystemModule: true,
          isActive: true,
          order: 1,
          permissions: ["grades:read", "grades:write", "grades:manage"],
          dependencies: ["user_management", "classroom_management"],
          exclusions: [],
        }),
      );
    });

    it("should create all expected system modules", async () => {
      const expectedModules = [
        { code: "GRADES", name: "Grades Management", category: ModuleCategory.ACADEMIC },
        { code: "EXAMS", name: "Exams Management", category: ModuleCategory.ACADEMIC },
        { code: "PAYMENTS", name: "Payments Management", category: ModuleCategory.FINANCIAL },
        { code: "USER_MGMT", name: "User Management", category: ModuleCategory.ADMINISTRATIVE },
        { code: "CLASSROOM", name: "Classroom Management", category: ModuleCategory.ACADEMIC },
        { code: "HOSTELS", name: "Hostel Management", category: ModuleCategory.STUDENT_LIFE },
        { code: "REPORTS", name: "Reports & Analytics", category: ModuleCategory.REPORTING },
        { code: "NOTIFICATIONS", name: "Notifications", category: ModuleCategory.COMMUNICATION },
        { code: "LIBRARY", name: "Library Management", category: ModuleCategory.ACADEMIC },
        { code: "TRANSPORT", name: "Transport Management", category: ModuleCategory.STUDENT_LIFE },
        {
          code: "ATTENDANCE",
          name: "Attendance Management",
          category: ModuleCategory.ADMINISTRATIVE,
        },
        {
          code: "INVENTORY",
          name: "Inventory Management",
          category: ModuleCategory.ADMINISTRATIVE,
        },
        { code: "TIMETABLE", name: "Timetable Management", category: ModuleCategory.ACADEMIC },
        { code: "PARENT_PORTAL", name: "Parent Portal", category: ModuleCategory.COMMUNICATION },
        { code: "STAFF_MGMT", name: "Staff Management", category: ModuleCategory.HUMAN_RESOURCES },
      ];

      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockImplementation((data) => data as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(mockTenantModule as any);

      await service.seedSystemModules();

      // Verify all expected modules were processed
      expectedModules.forEach((module) => {
        expect(tenantModuleRepository.findOne).toHaveBeenCalledWith({
          where: { code: module.code },
        });
      });
    });
  });

  describe("clearSystemModules", () => {
    it("should clear all system modules", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      jest.spyOn(tenantModuleRepository, "delete").mockResolvedValue({ affected: 15 } as any);

      await service.clearSystemModules();

      expect(tenantModuleRepository.delete).toHaveBeenCalledWith({ isSystemModule: true });
      expect(consoleSpy).toHaveBeenCalledWith("System modules cleared");

      consoleSpy.mockRestore();
    });
  });

  describe("getSystemModulesCount", () => {
    it("should return count of system modules", async () => {
      jest.spyOn(tenantModuleRepository, "count").mockResolvedValue(15);

      const result = await service.getSystemModulesCount();

      expect(tenantModuleRepository.count).toHaveBeenCalledWith({
        where: { isSystemModule: true },
      });
      expect(result).toBe(15);
    });

    it("should return 0 when no system modules exist", async () => {
      jest.spyOn(tenantModuleRepository, "count").mockResolvedValue(0);

      const result = await service.getSystemModulesCount();

      expect(result).toBe(0);
    });
  });

  describe("Module Categories", () => {
    it("should create modules with correct categories", async () => {
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockImplementation((data) => data as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(mockTenantModule as any);

      await service.seedSystemModules();

      // Verify academic modules
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "GRADES",
          category: ModuleCategory.ACADEMIC,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "EXAMS",
          category: ModuleCategory.ACADEMIC,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "CLASSROOM",
          category: ModuleCategory.ACADEMIC,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "LIBRARY",
          category: ModuleCategory.ACADEMIC,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "TIMETABLE",
          category: ModuleCategory.ACADEMIC,
        }),
      );

      // Verify financial modules
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PAYMENTS",
          category: ModuleCategory.FINANCIAL,
        }),
      );

      // Verify administrative modules
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "USER_MGMT",
          category: ModuleCategory.ADMINISTRATIVE,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "ATTENDANCE",
          category: ModuleCategory.ADMINISTRATIVE,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "INVENTORY",
          category: ModuleCategory.ADMINISTRATIVE,
        }),
      );

      // Verify communication modules
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "NOTIFICATIONS",
          category: ModuleCategory.COMMUNICATION,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PARENT_PORTAL",
          category: ModuleCategory.COMMUNICATION,
        }),
      );

      // Verify reporting modules
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "REPORTS",
          category: ModuleCategory.REPORTING,
        }),
      );

      // Verify student life modules
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "HOSTELS",
          category: ModuleCategory.STUDENT_LIFE,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "TRANSPORT",
          category: ModuleCategory.STUDENT_LIFE,
        }),
      );

      // Verify human resources modules
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "STAFF_MGMT",
          category: ModuleCategory.HUMAN_RESOURCES,
        }),
      );
    });
  });

  describe("Module Dependencies", () => {
    it("should create modules with correct dependencies", async () => {
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockImplementation((data) => data as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(mockTenantModule as any);

      await service.seedSystemModules();

      // Verify modules with dependencies
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "GRADES",
          dependencies: ["user_management", "classroom_management"],
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "EXAMS",
          dependencies: ["grades", "user_management"],
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PAYMENTS",
          dependencies: ["user_management"],
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "REPORTS",
          dependencies: ["grades", "payments", "user_management"],
        }),
      );

      // Verify modules without dependencies
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "USER_MGMT",
          dependencies: [],
        }),
      );
    });
  });

  describe("Module Permissions", () => {
    it("should create modules with appropriate permissions", async () => {
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockImplementation((data) => data as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(mockTenantModule as any);

      await service.seedSystemModules();

      // Verify permission patterns
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "GRADES",
          permissions: ["grades:read", "grades:write", "grades:manage"],
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PAYMENTS",
          permissions: ["payments:read", "payments:write", "payments:manage"],
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "REPORTS",
          permissions: ["reports:read", "reports:generate"],
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PARENT_PORTAL",
          permissions: ["parent:read", "parent:view"],
        }),
      );
    });
  });
});
