import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../shared/auth/guards/roles.guard";
import { RbacController } from "./rbac.controller";
import { RbacService } from "./rbac.service";

describe("RbacController", () => {
  let controller: RbacController;
  let service: RbacService;

  const mockUser = {
    id: "user-id",
    email: "test@example.com",
    tenantId: "tenant-id",
    roles: [],
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const mockRbacService = {
      createRole: jest.fn(),
      getRoles: jest.fn(),
      getRoleById: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      createPermission: jest.fn(),
      getPermissions: jest.fn(),
      getPermissionById: jest.fn(),
      updatePermission: jest.fn(),
      deletePermission: jest.fn(),
      assignPermissionsToRole: jest.fn(),
      removePermissionsFromRole: jest.fn(),
      assignRoleToUser: jest.fn(),
      removeRoleFromUser: jest.fn(),
      getUserRoles: jest.fn(),
      getRoleStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RbacController],
      providers: [
        {
          provide: RbacService,
          useValue: mockRbacService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<RbacController>(RbacController);
    service = module.get<RbacService>(RbacService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createRole", () => {
    it("should create a role", async () => {
      const createRoleDto = {
        name: "teacher",
        description: "Teacher role",
        isActive: true,
      };

      const mockRole = {
        id: "role-id",
        ...createRoleDto,
        tenantId: "tenant-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, "createRole").mockResolvedValue(mockRole);

      const result = await controller.createRole(createRoleDto, mockRequest);

      expect(service.createRole).toHaveBeenCalledWith(createRoleDto, "tenant-id");
      expect(result).toEqual(mockRole);
    });
  });

  describe("getRoles", () => {
    it("should get roles with filters", async () => {
      const filters = { isActive: true, search: "teacher" };
      const mockResponse = {
        roles: [
          {
            id: "role-id",
            name: "teacher",
            description: "Teacher role",
            isActive: true,
            tenantId: "tenant-id",
          },
        ],
        total: 1,
      };

      jest.spyOn(service, "getRoles").mockResolvedValue(mockResponse);

      const result = await controller.getRoles(filters, mockRequest);

      expect(service.getRoles).toHaveBeenCalledWith("tenant-id", filters);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getRoleById", () => {
    it("should get role by id", async () => {
      const mockRole = {
        id: "role-id",
        name: "teacher",
        description: "Teacher role",
        isActive: true,
        tenantId: "tenant-id",
        permissions: [],
        users: [],
      };

      jest.spyOn(service, "getRoleById").mockResolvedValue(mockRole);

      const result = await controller.getRoleById("role-id", mockRequest);

      expect(service.getRoleById).toHaveBeenCalledWith("role-id", "tenant-id");
      expect(result).toEqual(mockRole);
    });
  });

  describe("updateRole", () => {
    it("should update role", async () => {
      const updateRoleDto = {
        name: "senior_teacher",
        description: "Senior teacher role",
      };

      const mockRole = {
        id: "role-id",
        ...updateRoleDto,
        isActive: true,
        tenantId: "tenant-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, "updateRole").mockResolvedValue(mockRole);

      const result = await controller.updateRole("role-id", updateRoleDto, mockRequest);

      expect(service.updateRole).toHaveBeenCalledWith("role-id", updateRoleDto, "tenant-id");
      expect(result).toEqual(mockRole);
    });
  });

  describe("deleteRole", () => {
    it("should delete role", async () => {
      jest.spyOn(service, "deleteRole").mockResolvedValue(undefined);

      const result = await controller.deleteRole("role-id", mockRequest);

      expect(service.deleteRole).toHaveBeenCalledWith("role-id", "tenant-id");
      expect(result).toEqual({ message: "Role deleted successfully" });
    });
  });

  describe("createPermission", () => {
    it("should create permission", async () => {
      const createPermissionDto = {
        name: "student:read",
        description: "Read student data",
        resource: "student",
        action: "read",
        isActive: true,
      };

      const mockPermission = {
        id: "permission-id",
        ...createPermissionDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, "createPermission").mockResolvedValue(mockPermission);

      const result = await controller.createPermission(createPermissionDto);

      expect(service.createPermission).toHaveBeenCalledWith(createPermissionDto);
      expect(result).toEqual(mockPermission);
    });
  });

  describe("assignRoleToUser", () => {
    it("should assign role to user", async () => {
      const assignRoleDto = {
        userId: "user-id",
        roleId: "role-id",
      };

      const mockUser = {
        id: "user-id",
        email: "test@example.com",
        tenantId: "tenant-id",
        roles: [
          {
            id: "role-id",
            name: "teacher",
            description: "Teacher role",
          },
        ],
      };

      jest.spyOn(service, "assignRoleToUser").mockResolvedValue(mockUser);

      const result = await controller.assignRoleToUser(assignRoleDto, mockRequest);

      expect(service.assignRoleToUser).toHaveBeenCalledWith(assignRoleDto, "tenant-id");
      expect(result).toEqual(mockUser);
    });
  });

  describe("getStats", () => {
    it("should get RBAC statistics", async () => {
      const mockStats = {
        totalRoles: 5,
        activeRoles: 4,
        inactiveRoles: 1,
        totalPermissions: 20,
        activePermissions: 18,
        inactivePermissions: 2,
      };

      jest.spyOn(service, "getRoleStats").mockResolvedValue(mockStats);

      const result = await controller.getStats(mockRequest);

      expect(service.getRoleStats).toHaveBeenCalledWith("tenant-id");
      expect(result).toEqual(mockStats);
    });
  });
});
