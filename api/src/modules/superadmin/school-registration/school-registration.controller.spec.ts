import { Test, TestingModule } from "@nestjs/testing";
import {
  SchoolRegistrationStatus,
  SchoolType,
} from "../../../database/entities/school-registration.entity";
import { SchoolRegistrationController } from "./school-registration.controller";
import { SchoolRegistrationService } from "./school-registration.service";

describe("SchoolRegistrationController", () => {
  let controller: SchoolRegistrationController;
  let service: SchoolRegistrationService;

  const mockUser = {
    id: "user-123",
    tenantId: "tenant-123",
    email: "admin@example.com",
  };

  const mockRegistration = {
    id: "reg-123",
    tenantId: "tenant-123",
    schoolName: "Test School",
    schoolCode: "TS001",
    schoolType: SchoolType.SECONDARY,
    status: SchoolRegistrationStatus.PENDING,
    email: "test@school.com",
    principalName: "Principal Name",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
    const mockSchoolRegistrationService = {
      createRegistration: jest.fn(),
      getRegistrations: jest.fn(),
      searchRegistrations: jest.fn(),
      getRegistrationStats: jest.fn(),
      getRegistrationsByStatus: jest.fn(),
      getRegistrationById: jest.fn(),
      updateRegistration: jest.fn(),
      startReview: jest.fn(),
      approveRegistration: jest.fn(),
      rejectRegistration: jest.fn(),
      cancelRegistration: jest.fn(),
      deleteRegistration: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolRegistrationController],
      providers: [
        {
          provide: SchoolRegistrationService,
          useValue: mockSchoolRegistrationService,
        },
      ],
    }).compile();

    controller = module.get<SchoolRegistrationController>(SchoolRegistrationController);
    service = module.get<SchoolRegistrationService>(SchoolRegistrationService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createRegistration", () => {
    it("should create a new school registration", async () => {
      jest.spyOn(service, "createRegistration").mockResolvedValue(mockRegistration as any);

      const result = await controller.createRegistration(mockRegistrationData, {
        user: mockUser,
      } as any);

      expect(service.createRegistration).toHaveBeenCalledWith("tenant-123", mockRegistrationData);
      expect(result).toBe(mockRegistration);
    });
  });

  describe("getRegistrations", () => {
    it("should get school registrations with filters", async () => {
      const mockResult = {
        registrations: [mockRegistration],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      jest.spyOn(service, "getRegistrations").mockResolvedValue(mockResult as any);

      const result = await controller.getRegistrations(
        SchoolRegistrationStatus.PENDING,
        SchoolType.SECONDARY,
        "tenant-123",
        "search",
        "reviewer-123",
        "approver-123",
        new Date(),
        new Date(),
        1,
        20,
      );

      expect(service.getRegistrations).toHaveBeenCalledWith(
        {
          status: SchoolRegistrationStatus.PENDING,
          schoolType: SchoolType.SECONDARY,
          tenantId: "tenant-123",
          search: "search",
          reviewedBy: "reviewer-123",
          approvedBy: "approver-123",
          dateFrom: expect.any(Date),
          dateTo: expect.any(Date),
        },
        1,
        20,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe("searchRegistrations", () => {
    it("should search school registrations", async () => {
      const registrations = [mockRegistration];
      jest.spyOn(service, "searchRegistrations").mockResolvedValue(registrations as any);

      const result = await controller.searchRegistrations(
        "test query",
        SchoolRegistrationStatus.PENDING,
        SchoolType.SECONDARY,
        "tenant-123",
      );

      expect(service.searchRegistrations).toHaveBeenCalledWith("test query", {
        status: SchoolRegistrationStatus.PENDING,
        schoolType: SchoolType.SECONDARY,
        tenantId: "tenant-123",
      });
      expect(result).toBe(registrations);
    });
  });

  describe("getStats", () => {
    it("should get registration statistics", async () => {
      const stats = {
        total: 100,
        pending: 25,
        underReview: 15,
        approved: 45,
        rejected: 10,
        cancelled: 5,
      };
      jest.spyOn(service, "getRegistrationStats").mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(service.getRegistrationStats).toHaveBeenCalled();
      expect(result).toBe(stats);
    });
  });

  describe("getRegistrationsByStatus", () => {
    it("should get registrations by status", async () => {
      const registrations = [mockRegistration];
      jest.spyOn(service, "getRegistrationsByStatus").mockResolvedValue(registrations as any);

      const result = await controller.getRegistrationsByStatus(SchoolRegistrationStatus.PENDING);

      expect(service.getRegistrationsByStatus).toHaveBeenCalledWith(
        SchoolRegistrationStatus.PENDING,
      );
      expect(result).toBe(registrations);
    });
  });

  describe("getRegistrationById", () => {
    it("should get registration by ID", async () => {
      jest.spyOn(service, "getRegistrationById").mockResolvedValue(mockRegistration as any);

      const result = await controller.getRegistrationById("reg-123");

      expect(service.getRegistrationById).toHaveBeenCalledWith("reg-123");
      expect(result).toBe(mockRegistration);
    });
  });

  describe("updateRegistration", () => {
    it("should update registration", async () => {
      const updateData = { schoolName: "Updated School" };
      jest.spyOn(service, "updateRegistration").mockResolvedValue(mockRegistration as any);

      const result = await controller.updateRegistration("reg-123", updateData);

      expect(service.updateRegistration).toHaveBeenCalledWith("reg-123", updateData);
      expect(result).toBe(mockRegistration);
    });
  });

  describe("startReview", () => {
    it("should start review process", async () => {
      jest.spyOn(service, "startReview").mockResolvedValue(mockRegistration as any);

      const result = await controller.startReview("reg-123", { user: mockUser } as any);

      expect(service.startReview).toHaveBeenCalledWith("reg-123", "user-123");
      expect(result).toBe(mockRegistration);
    });
  });

  describe("approveRegistration", () => {
    it("should approve registration and create school", async () => {
      const body = { notes: "Approved" };
      jest.spyOn(service, "approveRegistration").mockResolvedValue(mockRegistration as any);

      const result = await controller.approveRegistration("reg-123", body, {
        user: mockUser,
      } as any);

      expect(service.approveRegistration).toHaveBeenCalledWith("reg-123", "user-123", "Approved");
      expect(result).toBe(mockRegistration);
    });
  });

  describe("rejectRegistration", () => {
    it("should reject registration", async () => {
      const body = { reason: "Incomplete documentation" };
      jest.spyOn(service, "rejectRegistration").mockResolvedValue(mockRegistration as any);

      const result = await controller.rejectRegistration("reg-123", body, {
        user: mockUser,
      } as any);

      expect(service.rejectRegistration).toHaveBeenCalledWith(
        "reg-123",
        "user-123",
        "Incomplete documentation",
      );
      expect(result).toBe(mockRegistration);
    });
  });

  describe("cancelRegistration", () => {
    it("should cancel registration", async () => {
      const body = { reason: "Cancelled by user" };
      jest.spyOn(service, "cancelRegistration").mockResolvedValue(mockRegistration as any);

      const result = await controller.cancelRegistration("reg-123", body, {
        user: mockUser,
      } as any);

      expect(service.cancelRegistration).toHaveBeenCalledWith(
        "reg-123",
        "user-123",
        "Cancelled by user",
      );
      expect(result).toBe(mockRegistration);
    });
  });

  describe("deleteRegistration", () => {
    it("should delete registration", async () => {
      jest.spyOn(service, "deleteRegistration").mockResolvedValue(undefined);

      const result = await controller.deleteRegistration("reg-123");

      expect(service.deleteRegistration).toHaveBeenCalledWith("reg-123");
      expect(result).toEqual({ message: "School registration deleted successfully" });
    });
  });
});
