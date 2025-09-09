import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../../database/entities/user.entity";
import {
  OnboardingStatus,
  OnboardingStep,
  UserOnboarding,
} from "../../../database/entities/user-onboarding.entity";
import { OnboardingService } from "./onboarding.service";

describe("OnboardingService", () => {
  let service: OnboardingService;
  let onboardingRepository: Repository<UserOnboarding>;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    userType: "teacher" as any,
    status: "pending" as any,
    tenantId: "tenant-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockOnboarding: UserOnboarding = {
    id: "onboarding-123",
    userId: "user-123",
    status: OnboardingStatus.NOT_STARTED,
    currentStep: OnboardingStep.ACCOUNT_CREATION,
    completedSteps: [],
    stepData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserOnboarding;

  beforeEach(async () => {
    const mockOnboardingRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: getRepositoryToken(UserOnboarding),
          useValue: mockOnboardingRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    onboardingRepository = module.get<Repository<UserOnboarding>>(
      getRepositoryToken(UserOnboarding),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("initializeOnboarding", () => {
    it("should create new onboarding for user", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);
      jest.spyOn(onboardingRepository, "findOne").mockResolvedValue(null);
      jest.spyOn(onboardingRepository, "create").mockReturnValue(mockOnboarding);
      jest.spyOn(onboardingRepository, "save").mockResolvedValue(mockOnboarding);

      const result = await service.initializeOnboarding("user-123");

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: "user-123" } });
      expect(onboardingRepository.findOne).toHaveBeenCalledWith({ where: { userId: "user-123" } });
      expect(onboardingRepository.create).toHaveBeenCalledWith({
        userId: "user-123",
        status: OnboardingStatus.NOT_STARTED,
        currentStep: OnboardingStep.ACCOUNT_CREATION,
        completedSteps: [],
        stepData: {},
      });
      expect(result).toBe(mockOnboarding);
    });

    it("should return existing onboarding if found", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);
      jest.spyOn(onboardingRepository, "findOne").mockResolvedValue(mockOnboarding);

      const result = await service.initializeOnboarding("user-123");

      expect(onboardingRepository.create).not.toHaveBeenCalled();
      expect(result).toBe(mockOnboarding);
    });

    it("should throw NotFoundException if user not found", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

      await expect(service.initializeOnboarding("user-123")).rejects.toThrow(NotFoundException);
    });
  });

  describe("startOnboarding", () => {
    it("should start onboarding successfully", async () => {
      const onboarding = { ...mockOnboarding, start: jest.fn() };
      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);
      jest.spyOn(onboardingRepository, "save").mockResolvedValue(onboarding);

      const result = await service.startOnboarding("user-123");

      expect(onboarding.start).toHaveBeenCalled();
      expect(onboardingRepository.save).toHaveBeenCalledWith(onboarding);
      expect(result).toBe(onboarding);
    });

    it("should throw BadRequestException if onboarding already started", async () => {
      const onboarding = { ...mockOnboarding, status: OnboardingStatus.IN_PROGRESS };
      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);

      await expect(service.startOnboarding("user-123")).rejects.toThrow(BadRequestException);
    });
  });

  describe("completeStep", () => {
    it("should complete step successfully", async () => {
      const onboarding = {
        ...mockOnboarding,
        status: OnboardingStatus.IN_PROGRESS,
        canProceedToStep: jest.fn().mockReturnValue(true),
        setStepData: jest.fn(),
        completeStep: jest.fn(),
        getNextStep: jest.fn().mockReturnValue(OnboardingStep.EMAIL_VERIFICATION),
        complete: jest.fn(),
      };

      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);
      jest.spyOn(onboardingRepository, "save").mockResolvedValue(onboarding);

      const stepData = {
        step: OnboardingStep.ACCOUNT_CREATION,
        data: { firstName: "John", lastName: "Doe" },
      };

      const result = await service.completeStep("user-123", stepData);

      expect(onboarding.canProceedToStep).toHaveBeenCalledWith(OnboardingStep.ACCOUNT_CREATION);
      expect(onboarding.setStepData).toHaveBeenCalledWith(
        OnboardingStep.ACCOUNT_CREATION,
        stepData.data,
      );
      expect(onboarding.completeStep).toHaveBeenCalledWith(OnboardingStep.ACCOUNT_CREATION);
      expect(result).toBe(onboarding);
    });

    it("should throw BadRequestException if onboarding not in progress", async () => {
      const onboarding = { ...mockOnboarding, status: OnboardingStatus.COMPLETED };
      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);

      await expect(
        service.completeStep("user-123", { step: OnboardingStep.ACCOUNT_CREATION }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if cannot proceed to step", async () => {
      const onboarding = {
        ...mockOnboarding,
        status: OnboardingStatus.IN_PROGRESS,
        canProceedToStep: jest.fn().mockReturnValue(false),
      };

      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);

      await expect(
        service.completeStep("user-123", { step: OnboardingStep.EMAIL_VERIFICATION }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getOnboardingProgress", () => {
    it("should return onboarding progress", async () => {
      const onboarding = {
        ...mockOnboarding,
        progressPercentage: 25,
        canProceedToStep: jest.fn().mockReturnValue(true),
        getNextStep: jest.fn().mockReturnValue(OnboardingStep.EMAIL_VERIFICATION),
      };

      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);

      const result = await service.getOnboardingProgress("user-123");

      expect(result).toEqual({
        id: "onboarding-123",
        userId: "user-123",
        status: OnboardingStatus.NOT_STARTED,
        currentStep: OnboardingStep.ACCOUNT_CREATION,
        completedSteps: [],
        progressPercentage: 25,
        startedAt: undefined,
        completedAt: undefined,
        lastStepAt: undefined,
        canProceed: true,
        nextStep: OnboardingStep.EMAIL_VERIFICATION,
      });
    });
  });

  describe("abandonOnboarding", () => {
    it("should abandon onboarding successfully", async () => {
      const onboarding = {
        ...mockOnboarding,
        status: OnboardingStatus.IN_PROGRESS,
        abandon: jest.fn(),
      };

      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);
      jest.spyOn(onboardingRepository, "save").mockResolvedValue(onboarding);

      const result = await service.abandonOnboarding("user-123", "User decided to stop");

      expect(onboarding.abandon).toHaveBeenCalled();
      expect(onboarding.notes).toBe("User decided to stop");
      expect(result).toBe(onboarding);
    });

    it("should throw BadRequestException if onboarding already completed", async () => {
      const onboarding = { ...mockOnboarding, status: OnboardingStatus.COMPLETED };
      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);

      await expect(service.abandonOnboarding("user-123")).rejects.toThrow(BadRequestException);
    });
  });

  describe("requireApproval", () => {
    it("should require approval successfully", async () => {
      const onboarding = {
        ...mockOnboarding,
        requireApproval: jest.fn(),
      };

      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);
      jest.spyOn(onboardingRepository, "save").mockResolvedValue(onboarding);

      const result = await service.requireApproval("user-123", "Needs admin review");

      expect(onboarding.requireApproval).toHaveBeenCalled();
      expect(onboarding.notes).toBe("Needs admin review");
      expect(result).toBe(onboarding);
    });
  });

  describe("approveOnboarding", () => {
    it("should approve onboarding successfully", async () => {
      const onboarding = {
        ...mockOnboarding,
        status: OnboardingStatus.REQUIRES_APPROVAL,
        approve: jest.fn(),
      };

      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);
      jest.spyOn(onboardingRepository, "save").mockResolvedValue(onboarding);

      const result = await service.approveOnboarding("user-123", "admin-456", "Approved by admin");

      expect(onboarding.approve).toHaveBeenCalledWith("admin-456");
      expect(onboarding.notes).toBe("Approved by admin");
      expect(result).toBe(onboarding);
    });

    it("should throw BadRequestException if onboarding does not require approval", async () => {
      const onboarding = { ...mockOnboarding, status: OnboardingStatus.IN_PROGRESS };
      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);

      await expect(service.approveOnboarding("user-123", "admin-456")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getOnboardingsRequiringApproval", () => {
    it("should return onboardings requiring approval", async () => {
      const onboardings = [mockOnboarding];
      jest.spyOn(onboardingRepository, "find").mockResolvedValue(onboardings);

      const result = await service.getOnboardingsRequiringApproval();

      expect(onboardingRepository.find).toHaveBeenCalledWith({
        where: { status: OnboardingStatus.REQUIRES_APPROVAL },
        relations: ["user"],
        order: { createdAt: "ASC" },
      });
      expect(result).toBe(onboardings);
    });
  });

  describe("getOnboardingStats", () => {
    it("should return onboarding statistics", async () => {
      jest.spyOn(onboardingRepository, "count").mockResolvedValue(100);
      jest
        .spyOn(onboardingRepository, "count")
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(50) // completed
        .mockResolvedValueOnce(30) // inProgress
        .mockResolvedValueOnce(15) // abandoned
        .mockResolvedValueOnce(5); // pendingApproval

      const result = await service.getOnboardingStats();

      expect(result).toEqual({
        total: 100,
        completed: 50,
        inProgress: 30,
        abandoned: 15,
        pendingApproval: 5,
      });
    });
  });

  describe("resetOnboarding", () => {
    it("should reset onboarding successfully", async () => {
      const onboarding = { ...mockOnboarding };
      jest.spyOn(service, "getOnboardingByUserId").mockResolvedValue(onboarding);
      jest.spyOn(onboardingRepository, "save").mockResolvedValue(onboarding);

      const result = await service.resetOnboarding("user-123");

      expect(onboarding.status).toBe(OnboardingStatus.NOT_STARTED);
      expect(onboarding.currentStep).toBe(OnboardingStep.ACCOUNT_CREATION);
      expect(onboarding.completedSteps).toEqual([]);
      expect(onboarding.stepData).toEqual({});
      expect(result).toBe(onboarding);
    });
  });
});
