import { BadRequestException, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Permission } from "../../../database/entities/permission.entity";
import { Role } from "../../../database/entities/role.entity";
import { User } from "../../../database/entities/user.entity";
import { RbacService } from "./rbac.service";

describe("RbacService", () => {
  let service: RbacService;
  let roleRepository: any;
  let permissionRepository: any;
  let userRepository: any;
  let eventEmitter: any;

  const mockRole = {
    id: "role-id",
    name: "teacher",
    description: "Teacher role",
    isActive: true,
    tenantId: "tenant-id",
    permissions: [],
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPermission = {
    id: "permission-id",
    name: "student:read",
    description: "Read student data",
    resource: "student",
    action: "read",
    isActive: true,
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: "user-id",
    email: "test@example.com",
    tenantId: "tenant-id",
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRoleRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findBy: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
      remove: jest.fn(),
    };

    const mockPermissionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findBy: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
      remove: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
    roleRepository = module.get(getRepositoryToken(Role));
    permissionRepository = module.get(getRepositoryToken(Permission));
    userRepository = module.get(getRepositoryToken(User));
    eventEmitter = module.get(EventEmitter2);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createRole", () => {
    it("should create a role successfully", async () => {
      const createRoleDto = {
        name: "teacher",
        description: "Teacher role",
        isActive: true,
      };

      roleRepository.findOne.mockResolvedValue(null);
      roleRepository.create.mockReturnValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.createRole(createRoleDto, "tenant-id");

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { name: "teacher", tenantId: "tenant-id" },
      });
      expect(roleRepository.create).toHaveBeenCalledWith({
        ...createRoleDto,
        tenantId: "tenant-id",
      });
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(eventEmitter.emit).toHaveBeenCalledWith("role.created", {
        role: mockRole,
        tenantId: "tenant-id",
      });
      expect(result).toEqual(mockRole);
    });

    it("should throw BadRequestException if role already exists", async () => {
      const createRoleDto = {
        name: "teacher",
        description: "Teacher role",
        isActive: true,
      };

      roleRepository.findOne.mockResolvedValue(mockRole);

      await expect(service.createRole(createRoleDto, "tenant-id")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getRoleById", () => {
    it("should return role by id", async () => {
      roleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.getRoleById("role-id", "tenant-id");

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: "role-id", tenantId: "tenant-id" },
        relations: ["permissions", "users"],
      });
      expect(result).toEqual(mockRole);
    });

    it("should throw NotFoundException if role not found", async () => {
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.getRoleById("role-id", "tenant-id")).rejects.toThrow(NotFoundException);
    });
  });

  describe("createPermission", () => {
    it("should create a permission successfully", async () => {
      const createPermissionDto = {
        name: "student:read",
        description: "Read student data",
        resource: "student",
        action: "read",
        isActive: true,
      };

      permissionRepository.findOne.mockResolvedValue(null);
      permissionRepository.create.mockReturnValue(mockPermission);
      permissionRepository.save.mockResolvedValue(mockPermission);

      const result = await service.createPermission(createPermissionDto);

      expect(permissionRepository.findOne).toHaveBeenCalledWith({
        where: { name: "student:read" },
      });
      expect(permissionRepository.create).toHaveBeenCalledWith(createPermissionDto);
      expect(permissionRepository.save).toHaveBeenCalledWith(mockPermission);
      expect(eventEmitter.emit).toHaveBeenCalledWith("permission.created", {
        permission: mockPermission,
      });
      expect(result).toEqual(mockPermission);
    });

    it("should throw BadRequestException if permission already exists", async () => {
      const createPermissionDto = {
        name: "student:read",
        description: "Read student data",
        resource: "student",
        action: "read",
        isActive: true,
      };

      permissionRepository.findOne.mockResolvedValue(mockPermission);

      await expect(service.createPermission(createPermissionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("assignRoleToUser", () => {
    it("should assign role to user successfully", async () => {
      const assignRoleDto = {
        userId: "user-id",
        roleId: "role-id",
      };

      const userWithRole = { ...mockUser, roles: [mockRole] };

      userRepository.findOne.mockResolvedValue(mockUser);
      roleRepository.findOne.mockResolvedValue(mockRole);
      userRepository.save.mockResolvedValue(userWithRole);

      const result = await service.assignRoleToUser(assignRoleDto, "tenant-id");

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: "user-id", tenantId: "tenant-id" },
        relations: ["roles"],
      });
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: "role-id", tenantId: "tenant-id" },
        relations: ["permissions", "users"],
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        roles: [mockRole],
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith("user.role.assigned", {
        user: userWithRole,
        role: mockRole,
        tenantId: "tenant-id",
      });
      expect(result).toEqual(userWithRole);
    });

    it("should throw NotFoundException if user not found", async () => {
      const assignRoleDto = {
        userId: "user-id",
        roleId: "role-id",
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.assignRoleToUser(assignRoleDto, "tenant-id")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if user already has role", async () => {
      const assignRoleDto = {
        userId: "user-id",
        roleId: "role-id",
      };

      const userWithRole = { ...mockUser, roles: [mockRole] };

      userRepository.findOne.mockResolvedValue(userWithRole);
      roleRepository.findOne.mockResolvedValue(mockRole);

      await expect(service.assignRoleToUser(assignRoleDto, "tenant-id")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getRoleStats", () => {
    it("should return role statistics", async () => {
      roleRepository.count
        .mockResolvedValueOnce(5) // totalRoles
        .mockResolvedValueOnce(4); // activeRoles
      permissionRepository.count
        .mockResolvedValueOnce(20) // totalPermissions
        .mockResolvedValueOnce(18); // activePermissions

      const result = await service.getRoleStats("tenant-id");

      expect(result).toEqual({
        totalRoles: 5,
        activeRoles: 4,
        inactiveRoles: 1,
        totalPermissions: 20,
        activePermissions: 18,
        inactivePermissions: 2,
      });
    });
  });
});
