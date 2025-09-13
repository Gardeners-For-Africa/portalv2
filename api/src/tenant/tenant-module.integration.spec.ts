import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant } from "../database/entities/tenant.entity";
import { ModuleCategory, TenantModule } from "../database/entities/tenant-module.entity";
import { TenantModuleAssignment } from "../database/entities/tenant-module-assignment.entity";
import {
  ModuleAuditAction,
  TenantModuleAudit,
} from "../database/entities/tenant-module-audit.entity";
import { User } from "../database/entities/user.entity";
import {
  BulkModuleUpdateDto,
  CreateTenantModuleDto,
  DisableModuleDto,
  EnableModuleDto,
  ValidateModuleConfigurationDto,
} from "./dto/tenant-module.dto";
import { TenantModuleController } from "./tenant-module.controller";
import { TenantModuleService } from "./tenant-module.service";
import { TenantModuleSeederService } from "./tenant-module-seeder.service";

describe("TenantModule Integration Tests", () => {
  let service: TenantModuleService;
  let controller: TenantModuleController;
  let seederService: TenantModuleSeederService;
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
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
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
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
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
      controllers: [TenantModuleController],
      providers: [
        TenantModuleService,
        TenantModuleSeederService,
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
    controller = module.get<TenantModuleController>(TenantModuleController);
    seederService = module.get<TenantModuleSeederService>(TenantModuleSeederService);
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

  describe("Complete Module Lifecycle", () => {
    it("should handle complete module lifecycle from creation to assignment", async () => {
      const createDto: CreateTenantModuleDto = {
        code: "LIFECYCLE_TEST",
        name: "Lifecycle Test Module",
        description: "Module for testing complete lifecycle",
        icon: "TestIcon",
        category: ModuleCategory.ACADEMIC,
        permissions: ["lifecycle:read", "lifecycle:write"],
        dependencies: ["user_management"],
      };

      const createdModule = {
        id: "lifecycle-module-123",
        ...createDto,
        isSystemModule: true,
        isActive: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Step 1: Create system module
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockReturnValue(createdModule as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(createdModule as any);

      const createResult = await service.createSystemModule(createDto);
      expect(createResult).toBe(createdModule);

      // Step 2: Enable module for tenant
      const enableDto: EnableModuleDto = {
        moduleId: createdModule.id,
        notes: "Enabling for testing lifecycle",
      };

      const assignment = {
        id: "assignment-123",
        tenantId: mockTenant.id,
        moduleId: createdModule.id,
        isEnabled: true,
        enabledAt: new Date(),
        enabledBy: mockUser.id,
        notes: enableDto.notes,
        configuration: {},
        tenant: mockTenant,
        module: createdModule,
        enabledByUser: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(service, "getSystemModuleById").mockResolvedValue(createdModule as any);
      jest.spyOn(assignmentRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(assignmentRepository, "create").mockReturnValue(assignment as any);
      jest.spyOn(assignmentRepository, "save").mockResolvedValue(assignment as any);
      jest.spyOn(service as any, "createAuditLog").mockResolvedValue({});
      jest.spyOn(service as any, "updateTenantModulesArray").mockResolvedValue(undefined);

      const enableResult = await service.enableModule(mockTenant.id, enableDto, mockUser.id);
      expect(enableResult).toBe(assignment);

      // Step 3: Get tenant modules to verify
      const systemModules = [createdModule];
      const assignments = [assignment];

      jest.spyOn(service, "getSystemModules").mockResolvedValue(systemModules as any);
      jest.spyOn(assignmentRepository, "find").mockResolvedValue(assignments as any);

      const tenantModulesResult = await service.getTenantModules(mockTenant.id);
      expect(tenantModulesResult.config.enabledModules).toHaveLength(1);
      expect(tenantModulesResult.config.enabledModules[0].moduleId).toBe(createdModule.id);

      // Step 4: Disable module
      const disableDto: DisableModuleDto = {
        moduleId: createdModule.id,
        reason: "Testing disable functionality",
      };

      // Mock that the assignment exists (since we just enabled it)
      jest.spyOn(assignmentRepository, "findOne").mockResolvedValue(assignment);
      jest.spyOn(assignmentRepository, "save").mockResolvedValue({
        ...assignment,
        isEnabled: false,
        disabledAt: new Date(),
        disabledBy: mockUser.id,
        reason: disableDto.reason,
      } as any);

      const disableResult = await service.disableModule(mockTenant.id, disableDto, mockUser.id);
      expect(disableResult.isEnabled).toBe(false);
    });
  });

  describe("Bulk Operations", () => {
    it("should handle bulk module operations", async () => {
      const modules = [
        {
          id: "module-1",
          code: "MODULE_1",
          name: "Module 1",
          category: ModuleCategory.ACADEMIC,
        },
        {
          id: "module-2",
          code: "MODULE_2",
          name: "Module 2",
          category: ModuleCategory.FINANCIAL,
        },
      ];

      const assignments = [
        {
          id: "assignment-1",
          tenantId: mockTenant.id,
          moduleId: "module-1",
          isEnabled: true,
        },
        {
          id: "assignment-2",
          tenantId: mockTenant.id,
          moduleId: "module-2",
          isEnabled: true,
        },
      ];

      const bulkDto: BulkModuleUpdateDto = {
        moduleIds: ["module-1", "module-2"],
        enabled: true,
        notes: "Bulk enabling modules for testing",
      };

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue(modules as any);
      jest.spyOn(service, "enableModule").mockResolvedValue(assignments[0] as any);

      const bulkResult = await service.bulkUpdateModules(mockTenant.id, bulkDto, mockUser.id);
      expect(bulkResult).toHaveLength(2);
      expect(service.enableModule).toHaveBeenCalledTimes(2);
    });
  });

  describe("Module Validation", () => {
    it("should validate module dependencies", async () => {
      const modules = [
        {
          id: "module-1",
          name: "Module 1",
          dependencies: ["user_management", "module-2"],
        },
        {
          id: "module-2",
          name: "Module 2",
          dependencies: ["user_management"],
        },
        {
          id: "user_management",
          name: "User Management",
          dependencies: [],
        },
      ];

      // Test with missing dependency
      const validateDto: ValidateModuleConfigurationDto = {
        moduleIds: ["module-1"], // Missing user_management and module-2
      };

      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue([modules[0]] as any);

      const result = await service.validateModuleConfiguration(mockTenant.id, validateDto);
      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].conflictType).toBe("dependency");

      // Test with all dependencies
      validateDto.moduleIds = ["module-1", "module-2", "user_management"];
      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue(modules as any);

      const validResult = await service.validateModuleConfiguration(mockTenant.id, validateDto);
      expect(validResult.isValid).toBe(true);
    });

    it("should validate module exclusions", async () => {
      const modules = [
        {
          id: "module-1",
          name: "Module 1",
          exclusions: ["module-2"],
        },
        {
          id: "module-2",
          name: "Module 2",
          exclusions: [],
        },
      ];

      const validateDto: ValidateModuleConfigurationDto = {
        moduleIds: ["module-1", "module-2"], // Conflicting modules
      };

      jest.spyOn(tenantModuleRepository, "find").mockResolvedValue(modules as any);

      const result = await service.validateModuleConfiguration(mockTenant.id, validateDto);
      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].conflictType).toBe("exclusion");
    });
  });

  describe("Statistics and Analytics", () => {
    it("should generate comprehensive module statistics", async () => {
      const mockStats = {
        totalModules: 15,
        enabledModules: 75,
        disabledModules: 45,
        mostUsedModules: [
          { moduleId: "grades", moduleName: "Grades", tenantCount: "8" },
          { moduleId: "payments", moduleName: "Payments", tenantCount: "6" },
        ],
        categoryBreakdown: {
          academic: 8,
          financial: 3,
          administrative: 4,
        },
        recentChanges: [
          {
            tenantId: mockTenant.id,
            tenantName: mockTenant.name,
            moduleId: "grades",
            moduleName: "Grades",
            action: ModuleAuditAction.ENABLED,
            createdAt: new Date(),
            user: { fullName: mockUser.fullName },
          },
        ],
      };

      jest.spyOn(tenantModuleRepository, "count").mockResolvedValue(15);
      jest
        .spyOn(assignmentRepository, "count")
        .mockResolvedValueOnce(120) // total
        .mockResolvedValueOnce(75); // enabled

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { category: "academic", count: "8" },
          { category: "financial", count: "3" },
          { category: "administrative", count: "4" },
        ]),
        getMany: jest.fn().mockResolvedValue(mockStats.recentChanges),
        getManyAndCount: jest.fn().mockResolvedValue([mockStats.recentChanges, 1]),
      };

      jest.spyOn(tenantModuleRepository, "createQueryBuilder").mockReturnValue(queryBuilder as any);
      jest.spyOn(assignmentRepository, "createQueryBuilder").mockReturnValue(queryBuilder as any);
      jest.spyOn(auditRepository, "createQueryBuilder").mockReturnValue(queryBuilder as any);

      const result = await service.getModuleStats();

      expect(result.totalModules).toBe(15);
      expect(result.enabledModules).toBe(75);
      expect(result.disabledModules).toBe(45);
      expect(result.categoryBreakdown).toEqual({
        academic: 8,
        financial: 3,
        administrative: 4,
      });
      expect(result.recentChanges).toHaveLength(1);
    });
  });

  describe("Controller Integration", () => {
    it("should handle complete controller workflow", async () => {
      const createDto: CreateTenantModuleDto = {
        code: "CONTROLLER_TEST",
        name: "Controller Test Module",
        description: "Module for testing controller integration",
        icon: "TestIcon",
        category: ModuleCategory.ADMINISTRATIVE,
      };

      const createdModule = {
        id: "controller-module-123",
        ...createDto,
        isSystemModule: true,
        isActive: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create module via controller
      jest.spyOn(service, "createSystemModule").mockResolvedValue(createdModule as any);
      const createResult = await controller.createSystemModule(createDto);
      expect(createResult).toBe(createdModule);

      // Enable module via controller
      const enableDto: EnableModuleDto = {
        moduleId: createdModule.id,
        notes: "Enabling via controller test",
      };

      const assignment = {
        id: "controller-assignment-123",
        tenantId: mockTenant.id,
        moduleId: createdModule.id,
        isEnabled: true,
        enabledAt: new Date(),
        enabledBy: mockUser.id,
        notes: enableDto.notes,
        configuration: {},
      };

      const req = { user: mockUser };
      jest.spyOn(service, "enableModule").mockResolvedValue(assignment as any);

      const enableResult = await controller.enableModule(mockTenant.id, enableDto, req);
      expect(enableResult).toBe(assignment);

      // Get tenant modules via controller
      const tenantModulesResponse = {
        tenantId: mockTenant.id,
        tenantName: mockTenant.name,
        config: {
          enabledModules: [assignment],
          totalModules: 1,
          enabledCount: 1,
        },
        availableModules: [createdModule],
        stats: {
          totalModules: 1,
          enabledModules: 1,
          disabledModules: 0,
          categoryBreakdown: { administrative: 1 },
        },
      };

      jest.spyOn(service, "getTenantModules").mockResolvedValue(tenantModulesResponse as any);
      const getResult = await controller.getTenantModules(mockTenant.id);
      expect(getResult).toBe(tenantModulesResponse);
    });
  });

  describe("Error Handling", () => {
    it("should handle module not found errors", async () => {
      const enableDto: EnableModuleDto = {
        moduleId: "non-existent-module",
        notes: "This should fail",
      };

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(service, "getSystemModuleById").mockResolvedValue(null);

      await expect(service.enableModule(mockTenant.id, enableDto, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should handle tenant not found errors", async () => {
      const enableDto: EnableModuleDto = {
        moduleId: "module-123",
        notes: "This should fail",
      };

      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(null);

      await expect(
        service.enableModule("non-existent-tenant", enableDto, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });

    it("should handle duplicate module creation", async () => {
      const createDto: CreateTenantModuleDto = {
        code: "DUPLICATE_TEST",
        name: "Duplicate Test Module",
        description: "This should fail",
        icon: "TestIcon",
        category: ModuleCategory.ACADEMIC,
      };

      const existingModule = { id: "existing-123", code: "DUPLICATE_TEST" };
      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(existingModule as any);

      await expect(service.createSystemModule(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("Seeder Integration", () => {
    it("should seed system modules successfully", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(tenantModuleRepository, "create").mockImplementation((data) => data as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue({} as any);

      await seederService.seedSystemModules();

      expect(tenantModuleRepository.findOne).toHaveBeenCalledTimes(15); // 15 system modules
      expect(tenantModuleRepository.create).toHaveBeenCalledTimes(15);
      expect(tenantModuleRepository.save).toHaveBeenCalledTimes(15);

      // Verify specific modules were created
      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "GRADES",
          name: "Grades Management",
          category: ModuleCategory.ACADEMIC,
        }),
      );

      expect(tenantModuleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PAYMENTS",
          name: "Payments Management",
          category: ModuleCategory.FINANCIAL,
        }),
      );

      consoleSpy.mockRestore();
    });

    it("should update existing modules during seeding", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const existingModule = {
        id: "existing-123",
        code: "GRADES",
        name: "Old Grades Module",
        category: ModuleCategory.ACADEMIC,
      };

      jest.spyOn(tenantModuleRepository, "findOne").mockResolvedValue(existingModule as any);
      jest.spyOn(tenantModuleRepository, "save").mockResolvedValue(existingModule as any);

      await seederService.seedSystemModules();

      expect(tenantModuleRepository.findOne).toHaveBeenCalledTimes(15);
      expect(tenantModuleRepository.create).not.toHaveBeenCalled();
      expect(tenantModuleRepository.save).toHaveBeenCalledTimes(15);

      consoleSpy.mockRestore();
    });
  });
});
