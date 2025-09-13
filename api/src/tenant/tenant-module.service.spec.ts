import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Tenant } from "../database/entities/tenant.entity";
import { ModuleCategory, TenantModule } from "../database/entities/tenant-module.entity";
import { TenantModuleAssignment } from "../database/entities/tenant-module-assignment.entity";
import {
  ModuleAuditAction,
  TenantModuleAudit,
} from "../database/entities/tenant-module-audit.entity";
import { User } from "../database/entities/user.entity";
import {
  AuditFiltersDto,
  BulkModuleUpdateDto,
  CreateTenantModuleDto,
  DisableModuleDto,
  EnableModuleDto,
  ModuleFiltersDto,
  UpdateTenantModuleDto,
  ValidateModuleConfigurationDto,
} from "./dto/tenant-module.dto";
import { TenantModuleService } from "./tenant-module.service";

describe("TenantModuleService", () => {
  let service: TenantModuleService;
  let tenantModuleRepository: Repository<TenantModule>;
  let assignmentRepository: Repository<TenantModuleAssignment>;
  let auditRepository: Repository<TenantModuleAudit>;
  let tenantRepository: Repository<Tenant>;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    email: "john@example.com",
    userType: "super_admin" as any,
    status: "active" as any,
    tenantId: "tenant-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockTenant: Tenant = {
    id: "tenant-123",
    name: "Test School",
    subdomain: "test-school",
    domain: "test-school.com",
    databaseName: "test_school_db",
    isActive: true,
    settings: {},
    modules: [],
    description: "Test school tenant",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Tenant;

  const mockTenantModule: TenantModule = {
    id: "module-123",
    code: "GRADES",
    name: "Grades Management",
    description: "Manage student grades and academic records",
    icon: "GraduationCap",
    category: ModuleCategory.ACADEMIC,
    isSystemModule: true,
    isActive: true,
    order: 1,
    permissions: ["grades:read", "grades:write", "grades:manage"],
    dependencies: ["user_management"],
    exclusions: [],
    configurationSchema: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAssignment: TenantModuleAssignment = {
    id: "assignment-123",
    tenantId: "tenant-123",
    moduleId: "module-123",
    isEnabled: true,
    enabledAt: new Date(),
    enabledBy: "user-123",
    disabledAt: null,
    disabledBy: null,
    notes: "Enabled for new academic year",
    reason: null,
    configuration: {},
    metadata: {},
    tenant: mockTenant,
    module: mockTenantModule,
    enabledByUser: mockUser,
    disabledByUser: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockTenantModuleRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
        getManyAndCount: jest.fn(),
      })),
    };

    const mockAssignmentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const mockAuditRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getManyAndCount: jest.fn(),
      })),
    };

    const mockTenantRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantModuleService,
        {
          provide: getRepositoryToken(TenantModule),
          useValue: mockTenantModuleRepository,
        },
        {
          provide: getRepositoryToken(TenantModuleAssignment),
          useValue: mockAssignmentRepository,
        },
        {
          provide: getRepositoryToken(TenantModuleAudit),
          useValue: mockAuditRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TenantModuleService>(TenantModuleService);
    tenantModuleRepository = module.get<Repository<TenantModule>>(getRepositoryToken(TenantModule));
    assignmentRepository = module.get<Repository<TenantModuleAssignment>>(
      getRepositoryToken(TenantModuleAssignment),
    );
    auditRepository = module.get<Repository<TenantModuleAudit>>(
      getRepositoryToken(TenantModuleAudit),
    );
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getSystemModules", () => {
    it("should return all active system modules", async () => {
      const modules = [mockTenantModule];
      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue(modules);

      const result = await service.getSystemModules();

      expect(tenantModuleRepository.find).toHaveBeenCalledWith({
        where: { isSystemModule: true, isActive: true },
        order: { order: "ASC", name: "ASC" },
      });
      expect(result).toBe(modules);
    });
  });

  describe("getSystemModuleById", () => {
    it("should return system module by id", async () => {
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(mockTenantModule);

      const result = await service.getSystemModuleById("module-123");

      expect(tenantModuleRepository.findOne).toHaveBeenCalledWith({
        where: { id: "module-123", isSystemModule: true },
      });
      expect(result).toBe(mockTenantModule);
    });

    it("should return null if module not found", async () => {
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);

      const result = await service.getSystemModuleById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("createSystemModule", () => {
    it("should create new system module", async () => {
      const createDto: CreateTenantModuleDto = {
        code: "NEW_MODULE",
        name: "New Module",
        description: "A new module",
        icon: "Icon",
        category: ModuleCategory.ACADEMIC,
      };

      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockReturnValue(mockTenantModule);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(mockTenantModule);

      const result = await service.createSystemModule(createDto);

      expect(tenantModuleRepository.findOne).toHaveBeenCalledWith({
        where: { code: "NEW_MODULE" },
      });
      expect(tenantModuleRepository.create).toHaveBeenCalledWith({
        ...createDto,
        isSystemModule: true,
      });
      expect(result).toBe(mockTenantModule);
    });

    it("should throw BadRequestException if module code already exists", async () => {
      const createDto: CreateTenantModuleDto = {
        code: "EXISTING_MODULE",
        name: "Existing Module",
        description: "An existing module",
        icon: "Icon",
        category: ModuleCategory.ACADEMIC,
      };

      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(mockTenantModule);

      await expect(service.createSystemModule(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateSystemModule", () => {
    it("should update system module", async () => {
      const updateDto: UpdateTenantModuleDto = {
        name: "Updated Module Name",
        description: "Updated description",
      };

      jest.spyOn(service, "getSystemModuleById").mockResolvedValue(mockTenantModule);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue({
        ...mockTenantModule,
        ...updateDto,
      });

      const result = await service.updateSystemModule("module-123", updateDto);

      expect(service.getSystemModuleById).toHaveBeenCalledWith("module-123");
      expect(tenantModuleRepository.save).toHaveBeenCalledWith({
        ...mockTenantModule,
        ...updateDto,
      });
      expect(result.name).toBe("Updated Module Name");
    });

    it("should throw NotFoundException if module not found", async () => {
      const updateDto: UpdateTenantModuleDto = { name: "Updated Name" };

      jest.spyOn(service, "getSystemModuleById").mockResolvedValue(null);

      await expect(service.updateSystemModule("non-existent", updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("deleteSystemModule", () => {
    it("should delete system module", async () => {
      jest.spyOn(service, "getSystemModuleById").mockResolvedValue(mockTenantModule);
      jest.spyOn(assignmentRepository, "count").mockResolvedValue(0);
      jest.spyOn(tenantModuleRepository, "remove").mockResolvedValue(mockTenantModule);

      await service.deleteSystemModule("module-123");

      expect(service.getSystemModuleById).toHaveBeenCalledWith("module-123");
      expect(assignmentRepository.count).toHaveBeenCalledWith({
        where: { moduleId: "module-123" },
      });
      expect(tenantModuleRepository.remove).toHaveBeenCalledWith(mockTenantModule);
    });

    it("should throw BadRequestException if module has assignments", async () => {
      jest.spyOn(service, "getSystemModuleById").mockResolvedValue(mockTenantModule);
      jest.spyOn(assignmentRepository, "count").mockResolvedValue(5);

      await expect(service.deleteSystemModule("module-123")).rejects.toThrow(BadRequestException);
    });
  });

  describe("getTenantModules", () => {
    it("should return tenant modules configuration", async () => {
      const systemModules = [mockTenantModule];
      const assignments = [mockAssignment];

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(service, "getSystemModules").mockResolvedValue(systemModules);
      jest.spyOn(assignmentRepository, "find").mockResolvedValue(assignments);

      const result = await service.getTenantModules("tenant-123");

      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: "tenant-123" },
      });
      expect(result.tenantId).toBe("tenant-123");
      expect(result.tenantName).toBe("Test School");
      expect(result.config.enabledModules).toHaveLength(1);
      expect(result.availableModules).toBe(systemModules);
      expect(result.stats.totalModules).toBe(1);
      expect(result.stats.enabledModules).toBe(1);
    });

    it("should throw NotFoundException if tenant not found", async () => {
      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(null);

      await expect(service.getTenantModules("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("enableModule", () => {
    it("should enable module for tenant", async () => {
      const enableDto: EnableModuleDto = {
        moduleId: "module-123",
        notes: "Enabling for new year",
      };

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(service, "getSystemModuleById").mockResolvedValue(mockTenantModule);
      jest.spyOn(assignmentRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(assignmentRepository, "create").mockReturnValue(mockAssignment);
      jest.spyOn(assignmentRepository, "save").mockResolvedValue(mockAssignment);
      jest.spyOn(service as any, "createAuditLog").mockResolvedValue({});
      jest.spyOn(service as any, "updateTenantModulesArray").mockResolvedValue(undefined);

      const result = await service.enableModule("tenant-123", enableDto, "user-123");

      expect(result).toBe(mockAssignment);
      expect(assignmentRepository.create).toHaveBeenCalledWith({
        tenantId: "tenant-123",
        moduleId: "module-123",
        isEnabled: true,
        enabledAt: expect.any(Date),
        enabledBy: "user-123",
        notes: "Enabling for new year",
        configuration: {},
      });
    });

    it("should throw BadRequestException if module already enabled", async () => {
      const enableDto: EnableModuleDto = { moduleId: "module-123" };
      const existingAssignment = { ...mockAssignment, isEnabled: true };

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(service, "getSystemModuleById").mockResolvedValue(mockTenantModule);
      jest.spyOn(assignmentRepository, "findOne").mockResolvedValue(existingAssignment);

      await expect(service.enableModule("tenant-123", enableDto, "user-123")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("disableModule", () => {
    it("should disable module for tenant", async () => {
      const disableDto: DisableModuleDto = {
        moduleId: "module-123",
        reason: "No longer needed",
      };

      jest.spyOn(assignmentRepository, "findOne").mockResolvedValue(mockAssignment);
      jest.spyOn(assignmentRepository, "save").mockResolvedValue({
        ...mockAssignment,
        isEnabled: false,
        disabledAt: expect.any(Date),
        disabledBy: "user-123",
        reason: "No longer needed",
      });
      jest.spyOn(service as any, "createAuditLog").mockResolvedValue({});
      jest.spyOn(service as any, "updateTenantModulesArray").mockResolvedValue(undefined);

      const result = await service.disableModule("tenant-123", disableDto, "user-123");

      expect(result.isEnabled).toBe(false);
      expect(result.disabledAt).toBeDefined();
      expect(result.disabledBy).toBe("user-123");
      expect(result.reason).toBe("No longer needed");
    });

    it("should throw NotFoundException if assignment not found", async () => {
      const disableDto: DisableModuleDto = { moduleId: "module-123" };

      jest.spyOn(assignmentRepository, "findOne").mockResolvedValue(null);

      await expect(service.disableModule("tenant-123", disableDto, "user-123")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("bulkUpdateModules", () => {
    it("should bulk enable modules", async () => {
      const bulkDto: BulkModuleUpdateDto = {
        moduleIds: ["module-123", "module-456"],
        enabled: true,
        notes: "Bulk enabling modules",
      };

      const modules = [mockTenantModule, { ...mockTenantModule, id: "module-456" }];

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue(modules);
      jest.spyOn(service, "enableModule").mockResolvedValue(mockAssignment);

      const result = await service.bulkUpdateModules("tenant-123", bulkDto, "user-123");

      expect(result).toHaveLength(2);
      expect(service.enableModule).toHaveBeenCalledTimes(2);
    });

    it("should throw BadRequestException for invalid module IDs", async () => {
      const bulkDto: BulkModuleUpdateDto = {
        moduleIds: ["module-123", "invalid-module"],
        enabled: true,
      };

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue([mockTenantModule]);

      await expect(service.bulkUpdateModules("tenant-123", bulkDto, "user-123")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("validateModuleConfiguration", () => {
    it("should validate module configuration with dependencies", async () => {
      const validateDto: ValidateModuleConfigurationDto = {
        moduleIds: ["module-123"],
      };

      const moduleWithDependency = {
        ...mockTenantModule,
        dependencies: ["user_management"],
      };

      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue([moduleWithDependency]);

      const result = await service.validateModuleConfiguration("tenant-123", validateDto);

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].conflictType).toBe("dependency");
      expect(result.suggestions).toContain("Add missing dependencies: user_management");
    });

    it("should validate module configuration with exclusions", async () => {
      const validateDto: ValidateModuleConfigurationDto = {
        moduleIds: ["module-123", "module-456"],
      };

      const moduleWithExclusions = {
        ...mockTenantModule,
        dependencies: [], // No dependencies to avoid multiple conflicts
        exclusions: ["module-456"],
      };

      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue([moduleWithExclusions]);

      const result = await service.validateModuleConfiguration("tenant-123", validateDto);

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].conflictType).toBe("exclusion");
    });

    it("should return valid configuration when no conflicts", async () => {
      const validateDto: ValidateModuleConfigurationDto = {
        moduleIds: ["module-123"],
      };

      const validModule = {
        ...mockTenantModule,
        dependencies: [],
        exclusions: [],
      };

      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue([validModule]);

      const result = await service.validateModuleConfiguration("tenant-123", validateDto);

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe("getModuleStats", () => {
    it("should return module statistics", async () => {
      const mockStats = {
        totalModules: 10,
        enabledModules: 50,
        disabledModules: 30,
        mostUsedModules: [{ moduleId: "module-123", moduleName: "Grades", tenantCount: "5" }],
        categoryBreakdown: { academic: 5, financial: 3, administrative: 2 },
        recentChanges: [
          {
            tenantId: "tenant-123",
            tenantName: "Test School",
            moduleId: "module-123",
            moduleName: "Grades",
            action: ModuleAuditAction.ENABLED,
            createdAt: new Date(),
            user: { fullName: "John Doe" },
          },
        ],
      };

      jest.spyOn(tenantModuleRepository, "count").mockResolvedValue(10);
      jest
        .spyOn(assignmentRepository, "count")
        .mockResolvedValueOnce(80) // total
        .mockResolvedValueOnce(50); // enabled

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { category: "academic", count: "5" },
          { category: "financial", count: "3" },
          { category: "administrative", count: "2" },
        ]),
        getMany: jest.fn().mockResolvedValue(mockStats.recentChanges),
        getManyAndCount: jest.fn().mockResolvedValue([mockStats.recentChanges, 1]),
      };

      jest.spyOn(tenantModuleRepository, "createQueryBuilder").mockReturnValue(queryBuilder as any);
      jest.spyOn(assignmentRepository, "createQueryBuilder").mockReturnValue(queryBuilder as any);
      jest.spyOn(auditRepository, "createQueryBuilder").mockReturnValue(queryBuilder as any);

      const result = await service.getModuleStats();

      expect(result.totalModules).toBe(10);
      expect(result.enabledModules).toBe(50);
      expect(result.disabledModules).toBe(30);
      expect(result.categoryBreakdown).toEqual({
        academic: 5,
        financial: 3,
        administrative: 2,
      });
    });
  });

  describe("Helper Methods", () => {
    describe("createAuditLog", () => {
      it("should create audit log", async () => {
        const mockAuditLog = {
          id: "audit-123",
          tenantId: "tenant-123",
          moduleId: "module-123",
          action: ModuleAuditAction.ENABLED,
          userId: "user-123",
          changes: { enabled: true },
          notes: "Test notes",
        };

        jest.spyOn(auditRepository, "create").mockReturnValue(mockAuditLog as any);
        jest.spyOn(auditRepository, "save").mockResolvedValue(mockAuditLog as any);

        const result = await (service as any).createAuditLog(
          "tenant-123",
          "module-123",
          ModuleAuditAction.ENABLED,
          "user-123",
          { enabled: true },
          "Test notes",
        );

        expect(auditRepository.create).toHaveBeenCalledWith({
          tenantId: "tenant-123",
          moduleId: "module-123",
          action: ModuleAuditAction.ENABLED,
          userId: "user-123",
          changes: { enabled: true },
          notes: "Test notes",
        });
        expect(result).toBe(mockAuditLog);
      });
    });

    describe("updateTenantModulesArray", () => {
      it("should update tenant modules array", async () => {
        // Create a fresh assignment for this test
        const testAssignment = {
          ...mockAssignment,
          isEnabled: true,
          enabledAt: new Date(),
          enabledBy: "user-123",
          module: {
            ...mockTenantModule,
            name: "Grades Management", // Ensure correct name
          },
        };

        const assignments = [testAssignment];
        const expectedModulesArray = [
          {
            moduleId: "module-123",
            moduleCode: "GRADES",
            moduleName: "Grades Management",
            isEnabled: true,
            enabledAt: expect.any(String),
            enabledBy: "user-123",
            notes: "Enabled for new academic year",
          },
        ];

        jest.spyOn(assignmentRepository, "find").mockResolvedValue(assignments);
        jest.spyOn(tenantRepository, "update").mockResolvedValue({} as any);

        await (service as any).updateTenantModulesArray("tenant-123");

        expect(assignmentRepository.find).toHaveBeenCalledWith({
          where: { tenantId: "tenant-123" },
          relations: ["module"],
        });
        expect(tenantRepository.update).toHaveBeenCalledWith("tenant-123", {
          modules: expectedModulesArray,
        });
      });
    });
  });
});
