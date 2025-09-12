import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../shared/auth/guards/roles.guard";
import {
  TeacherInvitationAcceptanceController,
  TeacherInvitationController,
} from "./teacher-invitation.controller";
import { TeacherInvitationService } from "./teacher-invitation.service";

describe("TeacherInvitationController", () => {
  let controller: TeacherInvitationController;
  let service: TeacherInvitationService;

  const mockUser = {
    id: "user-id",
    email: "admin@school.com",
    tenantId: "tenant-id",
    schoolId: "school-id",
  };

  const mockRequest = {
    user: mockUser,
    ip: "127.0.0.1",
    headers: { "user-agent": "test-agent" },
  };

  beforeEach(async () => {
    const mockTeacherInvitationService = {
      createInvitation: jest.fn(),
      getInvitations: jest.fn(),
      getInvitationById: jest.fn(),
      updateInvitation: jest.fn(),
      resendInvitation: jest.fn(),
      cancelInvitation: jest.fn(),
      getInvitationStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherInvitationController, TeacherInvitationAcceptanceController],
      providers: [
        {
          provide: TeacherInvitationService,
          useValue: mockTeacherInvitationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TeacherInvitationController>(TeacherInvitationController);
    service = module.get<TeacherInvitationService>(TeacherInvitationService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createInvitation", () => {
    it("should create an invitation", async () => {
      const createDto = {
        email: "teacher@example.com",
        firstName: "John",
        lastName: "Doe",
        message: "Welcome to our school!",
      };

      const mockResponse = {
        id: "invitation-id",
        email: "teacher@example.com",
        status: "pending",
        schoolId: "school-id",
        invitedBy: "user-id",
      };

      jest.spyOn(service, "createInvitation").mockResolvedValue(mockResponse as any);

      const result = await controller.createInvitation(createDto, mockRequest);

      expect(service.createInvitation).toHaveBeenCalledWith(
        createDto,
        "school-id",
        "user-id",
        "tenant-id",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getInvitations", () => {
    it("should get invitations with filters", async () => {
      const filters = { status: "pending", search: "teacher", page: 1, limit: 10 };
      const mockResponse = {
        invitations: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      jest.spyOn(service, "getInvitations").mockResolvedValue(mockResponse);

      const result = await controller.getInvitations(filters, mockRequest);

      expect(service.getInvitations).toHaveBeenCalledWith("school-id", "tenant-id", filters);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getStats", () => {
    it("should get invitation statistics", async () => {
      const mockStats = {
        total: 10,
        pending: 5,
        accepted: 3,
        declined: 1,
        expired: 1,
        cancelled: 0,
        expiringSoon: 2,
      };

      jest.spyOn(service, "getInvitationStats").mockResolvedValue(mockStats);

      const result = await controller.getStats(mockRequest);

      expect(service.getInvitationStats).toHaveBeenCalledWith("school-id", "tenant-id");
      expect(result).toEqual(mockStats);
    });
  });

  describe("getInvitationById", () => {
    it("should get invitation by id", async () => {
      const mockInvitation = {
        id: "invitation-id",
        email: "teacher@example.com",
        status: "pending",
      };

      jest.spyOn(service, "getInvitationById").mockResolvedValue(mockInvitation as any);

      const result = await controller.getInvitationById("invitation-id", mockRequest);

      expect(service.getInvitationById).toHaveBeenCalledWith(
        "invitation-id",
        "school-id",
        "tenant-id",
      );
      expect(result).toEqual(mockInvitation);
    });
  });

  describe("updateInvitation", () => {
    it("should update invitation", async () => {
      const updateDto = {
        firstName: "Jane",
        lastName: "Smith",
        message: "Updated message",
      };

      const mockResponse = {
        id: "invitation-id",
        firstName: "Jane",
        lastName: "Smith",
        message: "Updated message",
      };

      jest.spyOn(service, "updateInvitation").mockResolvedValue(mockResponse as any);

      const result = await controller.updateInvitation("invitation-id", updateDto, mockRequest);

      expect(service.updateInvitation).toHaveBeenCalledWith(
        "invitation-id",
        updateDto,
        "school-id",
        "tenant-id",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("resendInvitation", () => {
    it("should resend invitation", async () => {
      const resendDto = {
        message: "Reminder: Please accept your invitation",
      };

      const mockResponse = {
        id: "invitation-id",
        email: "teacher@example.com",
        status: "pending",
      };

      jest.spyOn(service, "resendInvitation").mockResolvedValue(mockResponse as any);

      const result = await controller.resendInvitation("invitation-id", resendDto, mockRequest);

      expect(service.resendInvitation).toHaveBeenCalledWith(
        "invitation-id",
        resendDto,
        "school-id",
        "tenant-id",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("cancelInvitation", () => {
    it("should cancel invitation", async () => {
      const mockResponse = {
        id: "invitation-id",
        status: "cancelled",
      };

      jest.spyOn(service, "cancelInvitation").mockResolvedValue(mockResponse as any);

      const result = await controller.cancelInvitation("invitation-id", mockRequest);

      expect(service.cancelInvitation).toHaveBeenCalledWith(
        "invitation-id",
        "school-id",
        "tenant-id",
        "127.0.0.1",
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

describe("TeacherInvitationAcceptanceController", () => {
  let controller: TeacherInvitationAcceptanceController;
  let service: TeacherInvitationService;

  const mockRequest = {
    ip: "127.0.0.1",
    headers: { "user-agent": "test-agent" },
  };

  beforeEach(async () => {
    const mockTeacherInvitationService = {
      getInvitationByToken: jest.fn(),
      acceptInvitation: jest.fn(),
      declineInvitation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherInvitationAcceptanceController],
      providers: [
        {
          provide: TeacherInvitationService,
          useValue: mockTeacherInvitationService,
        },
      ],
    }).compile();

    controller = module.get<TeacherInvitationAcceptanceController>(
      TeacherInvitationAcceptanceController,
    );
    service = module.get<TeacherInvitationService>(TeacherInvitationService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getInvitationByToken", () => {
    it("should get invitation by token", async () => {
      const mockInvitation = {
        id: "invitation-id",
        email: "teacher@example.com",
        status: "pending",
        school: { name: "Test School" },
      };

      jest.spyOn(service, "getInvitationByToken").mockResolvedValue(mockInvitation as any);

      const result = await controller.getInvitationByToken("invitation-token");

      expect(service.getInvitationByToken).toHaveBeenCalledWith("invitation-token");
      expect(result).toEqual(mockInvitation);
    });
  });

  describe("acceptInvitation", () => {
    it("should accept invitation", async () => {
      const acceptDto = {
        token: "invitation-token",
        firstName: "John",
        lastName: "Doe",
        password: "SecurePassword123!",
        phone: "+1234567890",
      };

      const mockResponse = {
        user: {
          id: "new-user-id",
          email: "teacher@example.com",
          firstName: "John",
          lastName: "Doe",
        },
        invitation: {
          id: "invitation-id",
          status: "accepted",
        },
      };

      jest.spyOn(service, "acceptInvitation").mockResolvedValue(mockResponse as any);

      const result = await controller.acceptInvitation(acceptDto, mockRequest);

      expect(service.acceptInvitation).toHaveBeenCalledWith(
        "invitation-token",
        {
          firstName: "John",
          lastName: "Doe",
          password: "SecurePassword123!",
          phone: "+1234567890",
        },
        "127.0.0.1",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("declineInvitation", () => {
    it("should decline invitation", async () => {
      const declineDto = {
        token: "invitation-token",
        reason: "Not interested in this position",
      };

      const mockResponse = {
        id: "invitation-id",
        status: "declined",
      };

      jest.spyOn(service, "declineInvitation").mockResolvedValue(mockResponse as any);

      const result = await controller.declineInvitation(declineDto, mockRequest);

      expect(service.declineInvitation).toHaveBeenCalledWith(
        "invitation-token",
        { reason: "Not interested in this position" },
        "127.0.0.1",
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
