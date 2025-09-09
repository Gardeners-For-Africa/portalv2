import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { School } from "../../../database/entities/school.entity";
import {
  SchoolRegistration,
  SchoolRegistrationStatus,
  SchoolType,
} from "../../../database/entities/school-registration.entity";
import { Tenant } from "../../../database/entities/tenant.entity";
import { User } from "../../../database/entities/user.entity";
import { DatabaseManagerService } from "../../../tenant/database-manager.service";
import { TenantDatabaseService } from "../../../tenant/tenant-database.service";
import { SchoolRegistrationService } from "./school-registration.service";

describe("SchoolRegistrationService", () => {
  let service: SchoolRegistrationService;
  let registrationRepository: Repository<SchoolRegistration>;
  let schoolRepository: Repository<School>;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;

  const mockTenant: Tenant = {
    id: "tenant-123",
    name: "Test Tenant",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Tenant;

  const mockSchool: School = {
    id: "school-123",
    name: "Test School",
    code: "TS001",
    tenantId: "tenant-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as School;

  const mockUser: User = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    userType: "super_admin" as any,
    status: "active" as any,
    tenantId: "tenant-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockRegistration: SchoolRegistration = {
    id: "reg-123",
    tenantId: "tenant-123",
    schoolName: "Test School",
    schoolCode: "TS001",
    schoolType: SchoolType.SECONDARY,
    address: "123 Test Street",
    phone: "+1234567890",
    email: "test@school.com",
    principalName: "Principal Name",
    principalEmail: "principal@school.com",
    status: SchoolRegistrationStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as SchoolRegistration;

  const mockRegistrationData = {
    schoolName: "Test School",
    schoolCode: "TS001",
    schoolType: SchoolType.SECONDARY,
    address: "123 Test Street",
    phone: "+1234567890",
    email: "test@school.com",
    principalName: "Principal Name",
    principalEmail: "principal@school.com",
  };

  beforeEach(async () => {
    const mockRegistrationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
    };

    const mockSchoolRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockTenantRepository = {
      findOne: jest.fn(),
    };

    const mockTenantDatabaseService = {
      createTenantDatabase: jest.fn(),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn(),
        save: jest.fn(),
      }),
    };

    const mockDatabaseManagerService = {
      createTenantDatabase: jest.fn(),
      getTenantDataSource: jest.fn().mockResolvedValue(mockDataSource),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolRegistrationService,
        {
          provide: getRepositoryToken(SchoolRegistration),
          useValue: mockRegistrationRepository,
        },
        {
          provide: getRepositoryToken(School),
          useValue: mockSchoolRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: TenantDatabaseService,
          useValue: mockTenantDatabaseService,
        },
        {
          provide: DatabaseManagerService,
          useValue: mockDatabaseManagerService,
        },
      ],
    }).compile();

    service = module.get<SchoolRegistrationService>(SchoolRegistrationService);
    registrationRepository = module.get<Repository<SchoolRegistration>>(
      getRepositoryToken(SchoolRegistration),
    );
    schoolRepository = module.get<Repository<School>>(getRepositoryToken(School));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createRegistration", () => {
    it("should create a new school registration", async () => {
      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest
        .spyOn(registrationRepository, "findOne")
        .mockResolvedValueOnce(null) // schoolCode check
        .mockResolvedValueOnce(null); // email check
      jest.spyOn(registrationRepository, "create").mockReturnValue(mockRegistration);
      jest.spyOn(registrationRepository, "save").mockResolvedValue(mockRegistration);

      const result = await service.createRegistration("tenant-123", mockRegistrationData);

      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: "tenant-123" } });
      expect(registrationRepository.create).toHaveBeenCalledWith({
        tenantId: "tenant-123",
        ...mockRegistrationData,
        status: SchoolRegistrationStatus.PENDING,
      });
      expect(result).toBe(mockRegistration);
    });

    it("should throw NotFoundException if tenant not found", async () => {
      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(null);

      await expect(service.createRegistration("tenant-123", mockRegistrationData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException if school code already exists", async () => {
      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest.spyOn(registrationRepository, "findOne").mockResolvedValue(mockRegistration);

      await expect(service.createRegistration("tenant-123", mockRegistrationData)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw ConflictException if email already exists", async () => {
      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant);
      jest
        .spyOn(registrationRepository, "findOne")
        .mockResolvedValueOnce(null) // schoolCode check
        .mockResolvedValueOnce(mockRegistration); // email check

      await expect(service.createRegistration("tenant-123", mockRegistrationData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("getRegistrationById", () => {
    it("should return school registration by ID", async () => {
      jest.spyOn(registrationRepository, "findOne").mockResolvedValue(mockRegistration);

      const result = await service.getRegistrationById("reg-123");

      expect(registrationRepository.findOne).toHaveBeenCalledWith({
        where: { id: "reg-123" },
        relations: ["tenant", "reviewer", "approver"],
      });
      expect(result).toBe(mockRegistration);
    });

    it("should throw NotFoundException if registration not found", async () => {
      jest.spyOn(registrationRepository, "findOne").mockResolvedValue(null);

      await expect(service.getRegistrationById("reg-123")).rejects.toThrow(NotFoundException);
    });
  });

  describe("startReview", () => {
    it("should start review process", async () => {
      const registration = {
        ...mockRegistration,
        status: SchoolRegistrationStatus.PENDING,
        startReview: jest.fn(),
        get canBeReviewed() {
          return this.status === SchoolRegistrationStatus.PENDING;
        },
      };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);
      jest.spyOn(registrationRepository, "save").mockResolvedValue(registration);

      const result = await service.startReview("reg-123", "user-123");

      expect(registration.startReview).toHaveBeenCalledWith("user-123");
      expect(registrationRepository.save).toHaveBeenCalledWith(registration);
      expect(result).toBe(registration);
    });

    it("should throw BadRequestException if cannot be reviewed", async () => {
      const registration = { ...mockRegistration, status: SchoolRegistrationStatus.APPROVED };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);

      await expect(service.startReview("reg-123", "user-123")).rejects.toThrow(BadRequestException);
    });
  });

  describe("approveRegistration", () => {
    it("should approve school registration and create school", async () => {
      const registration = {
        ...mockRegistration,
        status: SchoolRegistrationStatus.UNDER_REVIEW,
        approve: jest.fn(),
        get canBeApproved() {
          return this.status === SchoolRegistrationStatus.UNDER_REVIEW;
        },
      };
      const mockTenant = { id: "tenant-123", databaseName: "g4a_tenant_test_123" };

      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);
      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(mockTenant as any);
      jest.spyOn(schoolRepository, "create").mockReturnValue(mockSchool as any);
      jest.spyOn(schoolRepository, "save").mockResolvedValue(mockSchool as any);
      jest.spyOn(registrationRepository, "save").mockResolvedValue(registration);

      const result = await service.approveRegistration("reg-123", "user-123", "Approved");

      expect(registration.approve).toHaveBeenCalledWith("user-123", "school-123", "Approved");
      expect(registrationRepository.save).toHaveBeenCalledWith(registration);
      expect(result).toBe(registration);
    });

    it("should throw BadRequestException if cannot be approved", async () => {
      const registration = { ...mockRegistration, status: SchoolRegistrationStatus.PENDING };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);

      await expect(
        service.approveRegistration("reg-123", "user-123", "school-123"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if tenant not found", async () => {
      const registration = {
        ...mockRegistration,
        status: SchoolRegistrationStatus.UNDER_REVIEW,
        approve: jest.fn(),
        get canBeApproved() {
          return this.status === SchoolRegistrationStatus.UNDER_REVIEW;
        },
      };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);
      jest.spyOn(tenantRepository, "findOne").mockResolvedValue(null);

      await expect(service.approveRegistration("reg-123", "user-123", "Approved")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("rejectRegistration", () => {
    it("should reject school registration", async () => {
      const registration = {
        ...mockRegistration,
        status: SchoolRegistrationStatus.PENDING,
        reject: jest.fn(),
        get canBeRejected() {
          return [SchoolRegistrationStatus.PENDING, SchoolRegistrationStatus.UNDER_REVIEW].includes(
            this.status,
          );
        },
      };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);
      jest.spyOn(registrationRepository, "save").mockResolvedValue(registration);

      const result = await service.rejectRegistration(
        "reg-123",
        "user-123",
        "Incomplete documentation",
      );

      expect(registration.reject).toHaveBeenCalledWith("user-123", "Incomplete documentation");
      expect(registrationRepository.save).toHaveBeenCalledWith(registration);
      expect(result).toBe(registration);
    });

    it("should throw BadRequestException if cannot be rejected", async () => {
      const registration = { ...mockRegistration, status: SchoolRegistrationStatus.APPROVED };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);

      await expect(service.rejectRegistration("reg-123", "user-123", "Reason")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("cancelRegistration", () => {
    it("should cancel school registration", async () => {
      const registration = {
        ...mockRegistration,
        status: SchoolRegistrationStatus.PENDING,
        cancel: jest.fn(),
        get canBeCancelled() {
          return [SchoolRegistrationStatus.PENDING, SchoolRegistrationStatus.UNDER_REVIEW].includes(
            this.status,
          );
        },
      };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);
      jest.spyOn(registrationRepository, "save").mockResolvedValue(registration);

      const result = await service.cancelRegistration("reg-123", "user-123", "Cancelled by user");

      expect(registration.cancel).toHaveBeenCalledWith("user-123", "Cancelled by user");
      expect(registrationRepository.save).toHaveBeenCalledWith(registration);
      expect(result).toBe(registration);
    });

    it("should throw BadRequestException if cannot be cancelled", async () => {
      const registration = { ...mockRegistration, status: SchoolRegistrationStatus.APPROVED };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);

      await expect(service.cancelRegistration("reg-123", "user-123")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("updateRegistration", () => {
    it("should update school registration", async () => {
      const registration = { ...mockRegistration, status: SchoolRegistrationStatus.PENDING };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);
      jest.spyOn(registrationRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(registrationRepository, "save").mockResolvedValue(registration);

      const updateData = { schoolName: "Updated School Name" };
      const result = await service.updateRegistration("reg-123", updateData);

      expect(registrationRepository.save).toHaveBeenCalledWith(registration);
      expect(result).toBe(registration);
    });

    it("should throw BadRequestException if not pending", async () => {
      const registration = { ...mockRegistration, status: SchoolRegistrationStatus.APPROVED };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);

      await expect(
        service.updateRegistration("reg-123", { schoolName: "Updated" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("deleteRegistration", () => {
    it("should delete school registration", async () => {
      const registration = { ...mockRegistration, status: SchoolRegistrationStatus.PENDING };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);
      jest.spyOn(registrationRepository, "remove").mockResolvedValue(registration);

      await service.deleteRegistration("reg-123");

      expect(registrationRepository.remove).toHaveBeenCalledWith(registration);
    });

    it("should throw BadRequestException if approved", async () => {
      const registration = { ...mockRegistration, status: SchoolRegistrationStatus.APPROVED };
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(registration);

      await expect(service.deleteRegistration("reg-123")).rejects.toThrow(BadRequestException);
    });
  });

  describe("getRegistrationStats", () => {
    it("should return registration statistics", async () => {
      jest
        .spyOn(registrationRepository, "count")
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(25) // pending
        .mockResolvedValueOnce(15) // underReview
        .mockResolvedValueOnce(45) // approved
        .mockResolvedValueOnce(10) // rejected
        .mockResolvedValueOnce(5); // cancelled

      const result = await service.getRegistrationStats();

      expect(result).toEqual({
        total: 100,
        pending: 25,
        underReview: 15,
        approved: 45,
        rejected: 10,
        cancelled: 5,
      });
    });
  });

  describe("getRegistrationsByStatus", () => {
    it("should return registrations by status", async () => {
      const registrations = [mockRegistration];
      jest.spyOn(registrationRepository, "find").mockResolvedValue(registrations);

      const result = await service.getRegistrationsByStatus(SchoolRegistrationStatus.PENDING);

      expect(registrationRepository.find).toHaveBeenCalledWith({
        where: { status: SchoolRegistrationStatus.PENDING },
        relations: ["tenant", "reviewer", "approver"],
        order: { createdAt: "DESC" },
      });
      expect(result).toBe(registrations);
    });
  });
});
