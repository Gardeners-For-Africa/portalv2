import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { School } from "../../../database/entities/school.entity";
import { User, UserType } from "../../../database/entities/user.entity";
import { AuthService } from "../../../shared/auth/auth.service";
import { MailService } from "../../../shared/services/mail/mail.service";
import { InvitationStatus, TeacherInvitation } from "./entities/teacher-invitation.entity";
import { TeacherInvitationService } from "./teacher-invitation.service";

describe("TeacherInvitationService", () => {
  let service: TeacherInvitationService;
  let invitationRepository: any;
  let userRepository: any;
  let schoolRepository: any;
  let mailService: any;
  let authService: any;
  let eventEmitter: any;

  const mockSchool = {
    id: "school-id",
    name: "Test School",
    tenantId: "tenant-id",
    type: "primary",
  };

  const mockUser = {
    id: "user-id",
    email: "admin@school.com",
    firstName: "Admin",
    lastName: "User",
    tenantId: "tenant-id",
    getFullName: () => "Admin User",
  };

  const mockInvitation = {
    id: "invitation-id",
    email: "teacher@example.com",
    token: "invitation-token",
    status: InvitationStatus.PENDING,
    firstName: "John",
    lastName: "Doe",
    message: "Welcome to our school!",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    schoolId: "school-id",
    invitedBy: "user-id",
    school: mockSchool,
    inviter: mockUser,
    canBeAccepted: () => true,
    canBeDeclined: () => true,
    canBeCancelled: () => true,
    isExpired: () => false,
    accept: jest.fn(),
    decline: jest.fn(),
    cancel: jest.fn(),
    expire: jest.fn(),
    getFullName: () => "John Doe",
    getInvitationUrl: (baseUrl: string) => `${baseUrl}/invite/teacher?token=invitation-token`,
    getDaysUntilExpiry: () => 7,
  };

  beforeEach(async () => {
    const mockInvitationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      })),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockSchoolRepository = {
      findOne: jest.fn(),
    };

    const mockMailService = {
      sendTeacherInvitation: jest.fn(),
    };

    const mockAuthService = {
      register: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherInvitationService,
        {
          provide: getRepositoryToken(TeacherInvitation),
          useValue: mockInvitationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(School),
          useValue: mockSchoolRepository,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<TeacherInvitationService>(TeacherInvitationService);
    invitationRepository = module.get(getRepositoryToken(TeacherInvitation));
    userRepository = module.get(getRepositoryToken(User));
    schoolRepository = module.get(getRepositoryToken(School));
    mailService = module.get(MailService);
    authService = module.get(AuthService);
    eventEmitter = module.get(EventEmitter2);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createInvitation", () => {
    it("should create an invitation successfully", async () => {
      const createDto = {
        email: "teacher@example.com",
        firstName: "John",
        lastName: "Doe",
        message: "Welcome to our school!",
      };

      schoolRepository.findOne.mockResolvedValue(mockSchool);
      userRepository.findOne.mockResolvedValue(null);
      invitationRepository.findOne
        .mockResolvedValueOnce(null) // First call for existing invitation check
        .mockResolvedValueOnce(mockInvitation); // Second call for loading relations
      invitationRepository.create.mockReturnValue(mockInvitation);
      invitationRepository.save.mockResolvedValue(mockInvitation);
      mailService.sendTeacherInvitation.mockResolvedValue(undefined);

      const result = await service.createInvitation(createDto, "school-id", "user-id", "tenant-id");

      expect(schoolRepository.findOne).toHaveBeenCalledWith({
        where: { id: "school-id", tenantId: "tenant-id" },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: "teacher@example.com", tenantId: "tenant-id" },
      });
      expect(invitationRepository.create).toHaveBeenCalled();
      expect(invitationRepository.save).toHaveBeenCalled();
      expect(mailService.sendTeacherInvitation).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith("teacher.invitation.created", {
        invitation: mockInvitation,
        tenantId: "tenant-id",
      });
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException if school not found", async () => {
      const createDto = {
        email: "teacher@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      schoolRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createInvitation(createDto, "school-id", "user-id", "tenant-id"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if user already exists", async () => {
      const createDto = {
        email: "teacher@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      schoolRepository.findOne.mockResolvedValue(mockSchool);
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.createInvitation(createDto, "school-id", "user-id", "tenant-id"),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if pending invitation already exists", async () => {
      const createDto = {
        email: "teacher@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      schoolRepository.findOne.mockResolvedValue(mockSchool);
      userRepository.findOne.mockResolvedValue(null);
      invitationRepository.findOne.mockResolvedValue(mockInvitation);

      await expect(
        service.createInvitation(createDto, "school-id", "user-id", "tenant-id"),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("getInvitationById", () => {
    it("should return invitation by id", async () => {
      invitationRepository.findOne.mockResolvedValue(mockInvitation);

      const result = await service.getInvitationById("invitation-id", "school-id", "tenant-id");

      expect(invitationRepository.findOne).toHaveBeenCalledWith({
        where: { id: "invitation-id", schoolId: "school-id" },
        relations: ["school", "inviter", "acceptedByUser"],
      });
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException if invitation not found", async () => {
      invitationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getInvitationById("invitation-id", "school-id", "tenant-id"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("acceptInvitation", () => {
    it("should accept invitation successfully", async () => {
      const acceptDto = {
        firstName: "John",
        lastName: "Doe",
        password: "SecurePassword123!",
        phone: "+1234567890",
      };

      const newUser = {
        id: "new-user-id",
        email: "teacher@example.com",
        firstName: "John",
        lastName: "Doe",
        userType: UserType.TEACHER,
      };

      invitationRepository.findOne.mockResolvedValue(mockInvitation);
      userRepository.findOne.mockResolvedValue(null);
      authService.register.mockResolvedValue(newUser);
      invitationRepository.save.mockResolvedValue(mockInvitation);

      const result = await service.acceptInvitation("invitation-token", acceptDto, "client-info");

      expect(invitationRepository.findOne).toHaveBeenCalledWith({
        where: { token: "invitation-token" },
        relations: ["school", "inviter"],
      });
      expect(authService.register).toHaveBeenCalled();
      expect(mockInvitation.accept).toHaveBeenCalledWith("client-info");
      expect(invitationRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith("teacher.invitation.accepted", {
        invitation: mockInvitation,
        user: newUser,
        tenantId: "tenant-id",
      });
      expect(result).toEqual({
        user: newUser,
        invitation: expect.any(Object),
      });
    });

    it("should throw NotFoundException if invitation not found", async () => {
      const acceptDto = {
        firstName: "John",
        lastName: "Doe",
        password: "SecurePassword123!",
      };

      invitationRepository.findOne.mockResolvedValue(null);

      await expect(service.acceptInvitation("invalid-token", acceptDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if invitation cannot be accepted", async () => {
      const acceptDto = {
        firstName: "John",
        lastName: "Doe",
        password: "SecurePassword123!",
      };

      const expiredInvitation = { ...mockInvitation, canBeAccepted: () => false };
      invitationRepository.findOne.mockResolvedValue(expiredInvitation);

      await expect(service.acceptInvitation("invitation-token", acceptDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ConflictException if user already exists", async () => {
      const acceptDto = {
        firstName: "John",
        lastName: "Doe",
        password: "SecurePassword123!",
      };

      invitationRepository.findOne.mockResolvedValue(mockInvitation);
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.acceptInvitation("invitation-token", acceptDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("declineInvitation", () => {
    it("should decline invitation successfully", async () => {
      const declineDto = {
        reason: "Not interested in this position",
      };

      invitationRepository.findOne.mockResolvedValue(mockInvitation);
      invitationRepository.save.mockResolvedValue(mockInvitation);

      const result = await service.declineInvitation("invitation-token", declineDto, "client-info");

      expect(invitationRepository.findOne).toHaveBeenCalledWith({
        where: { token: "invitation-token" },
        relations: ["school"],
      });
      expect(mockInvitation.decline).toHaveBeenCalledWith("client-info");
      expect(invitationRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith("teacher.invitation.declined", {
        invitation: mockInvitation,
        tenantId: "tenant-id",
      });
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException if invitation not found", async () => {
      const declineDto = {
        reason: "Not interested",
      };

      invitationRepository.findOne.mockResolvedValue(null);

      await expect(service.declineInvitation("invalid-token", declineDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if invitation cannot be declined", async () => {
      const declineDto = {
        reason: "Not interested",
      };

      const invalidInvitation = { ...mockInvitation, canBeDeclined: () => false };
      invitationRepository.findOne.mockResolvedValue(invalidInvitation);

      await expect(service.declineInvitation("invitation-token", declineDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getInvitationStats", () => {
    it("should return invitation statistics", async () => {
      const mockStats = [
        { status: "pending", count: "5" },
        { status: "accepted", count: "3" },
        { status: "declined", count: "1" },
      ];

      const queryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      invitationRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      invitationRepository.count.mockResolvedValue(2); // expiringSoon

      const result = await service.getInvitationStats("school-id", "tenant-id");

      expect(result).toEqual({
        total: 9,
        pending: 5,
        accepted: 3,
        declined: 1,
        expired: 0,
        cancelled: 0,
        expiringSoon: 2,
      });
    });
  });

  describe("cleanupExpiredInvitations", () => {
    it("should cleanup expired invitations", async () => {
      const expiredInvitations = [
        { ...mockInvitation, id: "expired-1" },
        { ...mockInvitation, id: "expired-2" },
      ];

      invitationRepository.find.mockResolvedValue(expiredInvitations);
      invitationRepository.save.mockResolvedValue(expiredInvitations);

      const result = await service.cleanupExpiredInvitations();

      expect(invitationRepository.find).toHaveBeenCalledWith({
        where: {
          status: InvitationStatus.PENDING,
          expiresAt: expect.any(Object),
        },
      });
      expect(expiredInvitations[0].expire).toHaveBeenCalled();
      expect(expiredInvitations[1].expire).toHaveBeenCalled();
      expect(invitationRepository.save).toHaveBeenCalledWith(expiredInvitations);
      expect(result).toBe(2);
    });
  });
});
