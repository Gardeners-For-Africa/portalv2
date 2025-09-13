import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant } from "../database/entities/tenant.entity";
import { TenantModule } from "../database/entities/tenant-module.entity";
import { TenantModuleAssignment } from "../database/entities/tenant-module-assignment.entity";
import { TenantModuleAudit } from "../database/entities/tenant-module-audit.entity";
import { User } from "../database/entities/user.entity";
import { TenantModuleController } from "./tenant-module.controller";
import { TenantModuleService } from "./tenant-module.service";
import { TenantModuleSeederService } from "./tenant-module-seeder.service";

/**
 * Test configuration helper for tenant module system
 * Provides common setup for all tenant module tests
 */
export class TenantModuleTestConfig {
  static async createTestingModule() {
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

    return Test.createTestingModule({
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
    });
  }

  static getMockUser(): User {
    return {
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
  }

  static getMockTenant(): Tenant {
    return {
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
  }

  static getMockTenantModule(): TenantModule {
    return {
      id: "module-123",
      code: "GRADES",
      name: "Grades Management",
      description: "Manage student grades and academic records",
      icon: "GraduationCap",
      category: "academic" as any,
      isSystemModule: true,
      isActive: true,
      order: 1,
      permissions: ["grades:read", "grades:write", "grades:manage"],
      dependencies: ["user_management"],
      exclusions: [],
      configurationSchema: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TenantModule;
  }

  static getMockAssignment(): TenantModuleAssignment {
    return {
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
    } as TenantModuleAssignment;
  }

  static getMockAuditLog(): TenantModuleAudit {
    return {
      id: "audit-123",
      tenantId: "tenant-123",
      moduleId: "module-123",
      action: "enabled" as any,
      userId: "user-123",
      changes: { enabled: { from: false, to: true } },
      notes: "Module enabled for tenant",
      metadata: { ipAddress: "192.168.1.1" },
      createdAt: new Date(),
    } as TenantModuleAudit;
  }
}

/**
 * Common test utilities for tenant module tests
 */
export class TenantModuleTestUtils {
  static createMockQueryBuilder() {
    return {
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
    };
  }

  static mockConsoleLog() {
    return jest.spyOn(console, "log").mockImplementation();
  }

  static createMockRequest(user: User) {
    return { user };
  }

  static createMockResponse() {
    return {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
  }

  static createMockFile(content: any) {
    return {
      buffer: Buffer.from(JSON.stringify(content)),
    };
  }
}

/**
 * Test data factory for creating test objects
 */
export class TenantModuleTestDataFactory {
  static createTenantModule(overrides: Partial<TenantModule> = {}): TenantModule {
    return {
      id: "module-123",
      code: "TEST_MODULE",
      name: "Test Module",
      description: "A test module",
      icon: "TestIcon",
      category: "academic" as any,
      isSystemModule: true,
      isActive: true,
      order: 1,
      permissions: ["test:read", "test:write"],
      dependencies: [],
      exclusions: [],
      configurationSchema: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as TenantModule;
  }

  static createAssignment(overrides: Partial<TenantModuleAssignment> = {}): TenantModuleAssignment {
    return {
      id: "assignment-123",
      tenantId: "tenant-123",
      moduleId: "module-123",
      isEnabled: true,
      enabledAt: new Date(),
      enabledBy: "user-123",
      disabledAt: null,
      disabledBy: null,
      notes: "Test assignment",
      reason: null,
      configuration: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as TenantModuleAssignment;
  }

  static createAuditLog(overrides: Partial<TenantModuleAudit> = {}): TenantModuleAudit {
    return {
      id: "audit-123",
      tenantId: "tenant-123",
      moduleId: "module-123",
      action: "enabled" as any,
      userId: "user-123",
      changes: { enabled: { from: false, to: true } },
      notes: "Test audit log",
      metadata: {},
      createdAt: new Date(),
      ...overrides,
    } as TenantModuleAudit;
  }
}
