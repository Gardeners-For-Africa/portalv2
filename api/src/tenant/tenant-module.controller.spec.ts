import { Test, TestingModule } from "@nestjs/testing";
import { ModuleCategory } from "../database/entities/tenant-module.entity";
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
import { TenantModuleController } from "./tenant-module.controller";
import { TenantModuleService } from "./tenant-module.service";

describe("TenantModuleController", () => {
  let controller: TenantModuleController;
  let service: TenantModuleService;

  const mockTenantModule = {
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

  const mockAssignment = {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTenantModulesResponse = {
    tenantId: "tenant-123",
    tenantName: "Test School",
    config: {
      id: "config-tenant-123",
      tenantId: "tenant-123",
      tenantName: "Test School",
      enabledModules: [mockAssignment],
      totalModules: 10,
      enabledCount: 5,
      lastUpdated: new Date().toISOString(),
      updatedBy: "system",
      updatedByName: "System",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    availableModules: [mockTenantModule],
    stats: {
      totalModules: 10,
      enabledModules: 5,
      disabledModules: 5,
      categoryBreakdown: {
        academic: 3,
        financial: 2,
        administrative: 5,
      },
    },
  };

  const mockUser = {
    id: "user-123",
    email: "admin@example.com",
    fullName: "Admin User",
  };

  beforeEach(async () => {
    const mockTenantModuleService = {
      getSystemModules: jest.fn(),
      getSystemModuleById: jest.fn(),
      createSystemModule: jest.fn(),
      updateSystemModule: jest.fn(),
      deleteSystemModule: jest.fn(),
      getTenantModules: jest.fn(),
      getTenantModuleConfig: jest.fn(),
      enableModule: jest.fn(),
      disableModule: jest.fn(),
      bulkUpdateModules: jest.fn(),
      getTenantModuleAssignments: jest.fn(),
      validateModuleConfiguration: jest.fn(),
      getModuleAuditLogs: jest.fn(),
      getModuleStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantModuleController],
      providers: [
        {
          provide: TenantModuleService,
          useValue: mockTenantModuleService,
        },
      ],
    }).compile();

    controller = module.get<TenantModuleController>(TenantModuleController);
    service = module.get<TenantModuleService>(TenantModuleService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("System Modules", () => {
    describe("getSystemModules", () => {
      it("should return all system modules", async () => {
        const modules = [mockTenantModule];
        jest.spyOn(service, "getSystemModules").mockResolvedValue(modules as any);

        const result = await controller.getSystemModules();

        expect(service.getSystemModules).toHaveBeenCalled();
        expect(result).toBe(modules);
      });
    });

    describe("getSystemModuleById", () => {
      it("should return system module by id", async () => {
        jest.spyOn(service, "getSystemModuleById").mockResolvedValue(mockTenantModule as any);

        const result = await controller.getSystemModuleById("module-123");

        expect(service.getSystemModuleById).toHaveBeenCalledWith("module-123");
        expect(result).toBe(mockTenantModule);
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

        jest.spyOn(service, "createSystemModule").mockResolvedValue(mockTenantModule as any);

        const result = await controller.createSystemModule(createDto);

        expect(service.createSystemModule).toHaveBeenCalledWith(createDto);
        expect(result).toBe(mockTenantModule);
      });
    });

    describe("updateSystemModule", () => {
      it("should update system module", async () => {
        const updateDto: UpdateTenantModuleDto = {
          name: "Updated Module Name",
          description: "Updated description",
        };

        const updatedModule = { ...mockTenantModule, ...updateDto };
        jest.spyOn(service, "updateSystemModule").mockResolvedValue(updatedModule as any);

        const result = await controller.updateSystemModule("module-123", updateDto);

        expect(service.updateSystemModule).toHaveBeenCalledWith("module-123", updateDto);
        expect(result).toBe(updatedModule);
      });
    });

    describe("deleteSystemModule", () => {
      it("should delete system module", async () => {
        jest.spyOn(service, "deleteSystemModule").mockResolvedValue(undefined);

        await controller.deleteSystemModule("module-123");

        expect(service.deleteSystemModule).toHaveBeenCalledWith("module-123");
      });
    });
  });

  describe("Tenant Module Configuration", () => {
    describe("getTenantModules", () => {
      it("should return tenant modules", async () => {
        jest.spyOn(service, "getTenantModules").mockResolvedValue(mockTenantModulesResponse as any);

        const result = await controller.getTenantModules("tenant-123");

        expect(service.getTenantModules).toHaveBeenCalledWith("tenant-123");
        expect(result).toBe(mockTenantModulesResponse);
      });
    });

    describe("getTenantModuleConfig", () => {
      it("should return tenant module config", async () => {
        const config = {
          id: "config-tenant-123",
          tenantId: "tenant-123",
          enabledModules: [mockAssignment],
        };

        jest.spyOn(service, "getTenantModuleConfig").mockResolvedValue(config as any);

        const result = await controller.getTenantModuleConfig("tenant-123");

        expect(service.getTenantModuleConfig).toHaveBeenCalledWith("tenant-123");
        expect(result).toBe(config);
      });
    });
  });

  describe("Module Assignments", () => {
    describe("enableModule", () => {
      it("should enable module for tenant", async () => {
        const enableDto: EnableModuleDto = {
          moduleId: "module-123",
          notes: "Enabling for new year",
        };

        const req = { user: mockUser };

        jest.spyOn(service, "enableModule").mockResolvedValue(mockAssignment as any);

        const result = await controller.enableModule("tenant-123", enableDto, req);

        expect(service.enableModule).toHaveBeenCalledWith("tenant-123", enableDto, "user-123");
        expect(result).toBe(mockAssignment);
      });
    });

    describe("disableModule", () => {
      it("should disable module for tenant", async () => {
        const disableDto: DisableModuleDto = {
          moduleId: "module-123",
          reason: "No longer needed",
        };

        const req = { user: mockUser };

        jest.spyOn(service, "disableModule").mockResolvedValue(mockAssignment as any);

        const result = await controller.disableModule("tenant-123", disableDto, req);

        expect(service.disableModule).toHaveBeenCalledWith("tenant-123", disableDto, "user-123");
        expect(result).toBe(mockAssignment);
      });
    });

    describe("bulkUpdateModules", () => {
      it("should bulk update modules", async () => {
        const bulkDto: BulkModuleUpdateDto = {
          moduleIds: ["module-123", "module-456"],
          enabled: true,
          notes: "Bulk enabling modules",
        };

        const req = { user: mockUser };

        jest.spyOn(service, "bulkUpdateModules").mockResolvedValue([mockAssignment] as any);

        const result = await controller.bulkUpdateModules("tenant-123", bulkDto, req);

        expect(service.bulkUpdateModules).toHaveBeenCalledWith("tenant-123", bulkDto, "user-123");
        expect(result).toEqual([mockAssignment]);
      });
    });

    describe("getTenantModuleAssignments", () => {
      it("should return tenant module assignments", async () => {
        const filters: ModuleFiltersDto = {
          category: ModuleCategory.ACADEMIC,
          isEnabled: true,
          search: "grades",
          page: 1,
          limit: 20,
        };

        const assignmentsResponse = {
          assignments: [mockAssignment],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        };

        jest
          .spyOn(service, "getTenantModuleAssignments")
          .mockResolvedValue(assignmentsResponse as any);

        const result = await controller.getTenantModuleAssignments("tenant-123", filters);

        expect(service.getTenantModuleAssignments).toHaveBeenCalledWith("tenant-123", filters);
        expect(result).toBe(assignmentsResponse);
      });
    });

    describe("getTenantModuleAssignment", () => {
      it("should throw not implemented error", async () => {
        await expect(
          controller.getTenantModuleAssignment("tenant-123", "assignment-123"),
        ).rejects.toThrow("Not implemented yet");
      });
    });
  });

  describe("Validation", () => {
    describe("validateModuleConfiguration", () => {
      it("should validate module configuration", async () => {
        const validateDto: ValidateModuleConfigurationDto = {
          moduleIds: ["module-123", "module-456"],
        };

        const validationResult = {
          isValid: true,
          conflicts: [],
          suggestions: [],
        };

        jest.spyOn(service, "validateModuleConfiguration").mockResolvedValue(validationResult);

        const result = await controller.validateModuleConfiguration("tenant-123", validateDto);

        expect(service.validateModuleConfiguration).toHaveBeenCalledWith("tenant-123", validateDto);
        expect(result).toBe(validationResult);
      });
    });
  });

  describe("Audit Logs", () => {
    describe("getModuleAuditLogs", () => {
      it("should return module audit logs", async () => {
        const filters: AuditFiltersDto = {
          moduleId: "module-123",
          action: "enabled",
          userId: "user-123",
          dateFrom: "2024-01-01",
          dateTo: "2024-12-31",
          page: 1,
          limit: 20,
        };

        const auditLogsResponse = {
          logs: [
            {
              id: "audit-123",
              moduleId: "module-123",
              moduleName: "Grades Management",
              action: "enabled",
              userId: "user-123",
              userName: "Admin User",
              changes: { enabled: true },
              notes: "Enabled for new year",
              metadata: {},
              timestamp: new Date().toISOString(),
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        };

        jest.spyOn(service, "getModuleAuditLogs").mockResolvedValue(auditLogsResponse as any);

        const result = await controller.getModuleAuditLogs("tenant-123", filters);

        expect(service.getModuleAuditLogs).toHaveBeenCalledWith("tenant-123", filters);
        expect(result).toBe(auditLogsResponse);
      });
    });
  });

  describe("Statistics", () => {
    describe("getModuleStats", () => {
      it("should return global module statistics", async () => {
        const stats = {
          totalModules: 15,
          enabledModules: 75,
          disabledModules: 45,
          mostUsedModules: [
            { moduleId: "module-123", moduleName: "Grades", tenantCount: "8" },
            { moduleId: "module-456", moduleName: "Payments", tenantCount: "6" },
          ],
          categoryBreakdown: {
            academic: 8,
            financial: 3,
            administrative: 4,
          },
          recentChanges: [
            {
              tenantId: "tenant-123",
              tenantName: "Test School",
              moduleId: "module-123",
              moduleName: "Grades",
              action: "enabled",
              timestamp: new Date().toISOString(),
              updatedBy: "Admin User",
            },
          ],
        };

        jest.spyOn(service, "getModuleStats").mockResolvedValue(stats);

        const result = await controller.getModuleStats();

        expect(service.getModuleStats).toHaveBeenCalled();
        expect(result).toBe(stats);
      });
    });

    describe("getTenantModuleStats", () => {
      it("should return tenant-specific module statistics", async () => {
        const tenantStats = {
          totalModules: 10,
          enabledModules: 5,
          disabledModules: 5,
          categoryBreakdown: {
            academic: 3,
            financial: 2,
            administrative: 5,
          },
          recentChanges: [],
        };

        jest.spyOn(service, "getTenantModules").mockResolvedValue(mockTenantModulesResponse as any);

        const result = await controller.getTenantModuleStats("tenant-123");

        expect(service.getTenantModules).toHaveBeenCalledWith("tenant-123");
        expect(result).toEqual({
          totalModules: 10,
          enabledModules: 5,
          disabledModules: 5,
          categoryBreakdown: {
            academic: 3,
            financial: 2,
            administrative: 5,
          },
          recentChanges: [],
        });
      });
    });
  });

  describe("Export/Import", () => {
    describe("exportTenantModules", () => {
      it("should export tenant modules configuration", async () => {
        const mockResponse = {
          setHeader: jest.fn(),
          send: jest.fn(),
        };

        jest.spyOn(service, "getTenantModules").mockResolvedValue(mockTenantModulesResponse as any);

        await controller.exportTenantModules("tenant-123", mockResponse as any);

        expect(service.getTenantModules).toHaveBeenCalledWith("tenant-123");
        expect(mockResponse.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          "Content-Disposition",
          'attachment; filename="Test School-modules.json"',
        );
        expect(mockResponse.send).toHaveBeenCalledWith({
          tenantId: "tenant-123",
          tenantName: "Test School",
          modules: [mockAssignment],
          exportedAt: expect.any(String),
          version: "1.0",
        });
      });
    });

    describe("importTenantModules", () => {
      it("should import tenant modules configuration", async () => {
        const mockFile = {
          buffer: Buffer.from(
            JSON.stringify({
              tenantId: "source-tenant-123",
              tenantName: "Source School",
              modules: [
                {
                  moduleId: "module-123",
                  moduleCode: "GRADES",
                  moduleName: "Grades Management",
                  isEnabled: true,
                },
              ],
              exportedAt: "2024-01-01T00:00:00.000Z",
              version: "1.0",
            }),
          ),
        };

        const req = { user: mockUser };

        jest.spyOn(service, "bulkUpdateModules").mockResolvedValue([mockAssignment] as any);

        const result = await controller.importTenantModules("tenant-123", mockFile as any, req);

        expect(service.bulkUpdateModules).toHaveBeenCalledWith(
          "tenant-123",
          {
            moduleIds: ["module-123"],
            enabled: true,
            notes: "Imported from Source School on 2024-01-01T00:00:00.000Z",
          },
          "user-123",
        );
        expect(result).toEqual([mockAssignment]);
      });

      it("should throw error for invalid file format", async () => {
        const mockFile = {
          buffer: Buffer.from("invalid json"),
        };

        const req = { user: mockUser };

        await expect(
          controller.importTenantModules("tenant-123", mockFile as any, req),
        ).rejects.toThrow(
          "Failed to import modules: Unexpected token 'i', \"invalid json\" is not valid JSON",
        );
      });

      it("should throw error for missing file", async () => {
        const req = { user: mockUser };

        await expect(
          controller.importTenantModules("tenant-123", null as any, req),
        ).rejects.toThrow("No file uploaded");
      });

      it("should throw error for invalid import data", async () => {
        const mockFile = {
          buffer: Buffer.from(
            JSON.stringify({
              tenantId: "source-tenant-123",
              tenantName: "Source School",
              // missing modules array
              exportedAt: "2024-01-01T00:00:00.000Z",
              version: "1.0",
            }),
          ),
        };

        const req = { user: mockUser };

        await expect(
          controller.importTenantModules("tenant-123", mockFile as any, req),
        ).rejects.toThrow("Failed to import modules: Invalid import file format");
      });
    });
  });
});
