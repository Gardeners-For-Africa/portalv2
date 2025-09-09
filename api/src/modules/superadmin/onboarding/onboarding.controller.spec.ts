import { Test, TestingModule } from "@nestjs/testing";
import {
  OnboardingStatus,
  OnboardingStep,
} from "../../../database/entities/user-onboarding.entity";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";

describe("OnboardingController", () => {
  let controller: OnboardingController;
  let service: OnboardingService;

  const mockUser = {
    id: "user-123",
    email: "john@example.com",
  };

  const mockOnboarding = {
    id: "onboarding-123",
    userId: "user-123",
    status: OnboardingStatus.IN_PROGRESS,
    currentStep: OnboardingStep.ACCOUNT_CREATION,
    completedSteps: [],
    progressPercentage: 25,
    startedAt: new Date(),
    canProceed: true,
    nextStep: OnboardingStep.EMAIL_VERIFICATION,
  };

  beforeEach(async () => {
    const mockOnboardingService = {
      initializeOnboarding: jest.fn(),
      startOnboarding: jest.fn(),
      completeStep: jest.fn(),
      getOnboardingProgress: jest.fn(),
      abandonOnboarding: jest.fn(),
      requireApproval: jest.fn(),
      approveOnboarding: jest.fn(),
      getOnboardingsRequiringApproval: jest.fn(),
      getOnboardingStats: jest.fn(),
      resetOnboarding: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        {
          provide: OnboardingService,
          useValue: mockOnboardingService,
        },
      ],
    }).compile();

    controller = module.get<OnboardingController>(OnboardingController);
    service = module.get<OnboardingService>(OnboardingService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("initializeOnboarding", () => {
    it("should initialize onboarding for user", async () => {
      jest.spyOn(service, "initializeOnboarding").mockResolvedValue(mockOnboarding as any);

      const result = await controller.initializeOnboarding({ user: mockUser } as any);

      expect(service.initializeOnboarding).toHaveBeenCalledWith("user-123");
      expect(result).toBe(mockOnboarding);
    });
  });

  describe("startOnboarding", () => {
    it("should start onboarding for user", async () => {
      jest.spyOn(service, "startOnboarding").mockResolvedValue(mockOnboarding as any);

      const result = await controller.startOnboarding({ user: mockUser } as any);

      expect(service.startOnboarding).toHaveBeenCalledWith("user-123");
      expect(result).toBe(mockOnboarding);
    });
  });

  describe("completeStep", () => {
    it("should complete step for user", async () => {
      const stepData = {
        step: OnboardingStep.ACCOUNT_CREATION,
        data: { firstName: "John", lastName: "Doe" },
      };

      jest.spyOn(service, "completeStep").mockResolvedValue(mockOnboarding as any);

      const result = await controller.completeStep({ user: mockUser } as any, stepData);

      expect(service.completeStep).toHaveBeenCalledWith("user-123", stepData);
      expect(result).toBe(mockOnboarding);
    });
  });

  describe("getProgress", () => {
    it("should get onboarding progress for user", async () => {
      jest.spyOn(service, "getOnboardingProgress").mockResolvedValue(mockOnboarding as any);

      const result = await controller.getProgress({ user: mockUser } as any);

      expect(service.getOnboardingProgress).toHaveBeenCalledWith("user-123");
      expect(result).toBe(mockOnboarding);
    });
  });

  describe("abandonOnboarding", () => {
    it("should abandon onboarding for user", async () => {
      const body = { reason: "User decided to stop" };
      jest.spyOn(service, "abandonOnboarding").mockResolvedValue(mockOnboarding as any);

      const result = await controller.abandonOnboarding({ user: mockUser } as any, body);

      expect(service.abandonOnboarding).toHaveBeenCalledWith("user-123", "User decided to stop");
      expect(result).toBe(mockOnboarding);
    });
  });

  describe("requireApproval", () => {
    it("should require approval for user onboarding", async () => {
      const body = { notes: "Needs admin review" };
      jest.spyOn(service, "requireApproval").mockResolvedValue(mockOnboarding as any);

      const result = await controller.requireApproval({ user: mockUser } as any, body);

      expect(service.requireApproval).toHaveBeenCalledWith("user-123", "Needs admin review");
      expect(result).toBe(mockOnboarding);
    });
  });

  describe("approveOnboarding", () => {
    it("should approve onboarding for user", async () => {
      const body = { notes: "Approved by admin" };
      jest.spyOn(service, "approveOnboarding").mockResolvedValue(mockOnboarding as any);

      const result = await controller.approveOnboarding(
        "user-456",
        { user: mockUser } as any,
        body,
      );

      expect(service.approveOnboarding).toHaveBeenCalledWith(
        "user-456",
        "user-123",
        "Approved by admin",
      );
      expect(result).toBe(mockOnboarding);
    });
  });

  describe("getPendingApprovals", () => {
    it("should get onboardings requiring approval", async () => {
      const pendingOnboardings = [mockOnboarding];
      jest
        .spyOn(service, "getOnboardingsRequiringApproval")
        .mockResolvedValue(pendingOnboardings as any);

      const result = await controller.getPendingApprovals();

      expect(service.getOnboardingsRequiringApproval).toHaveBeenCalled();
      expect(result).toBe(pendingOnboardings);
    });
  });

  describe("getStats", () => {
    it("should get onboarding statistics", async () => {
      const stats = {
        total: 100,
        completed: 50,
        inProgress: 30,
        abandoned: 15,
        pendingApproval: 5,
      };
      jest.spyOn(service, "getOnboardingStats").mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(service.getOnboardingStats).toHaveBeenCalled();
      expect(result).toBe(stats);
    });
  });

  describe("resetOnboarding", () => {
    it("should reset onboarding for user", async () => {
      jest.spyOn(service, "resetOnboarding").mockResolvedValue(mockOnboarding as any);

      const result = await controller.resetOnboarding("user-456");

      expect(service.resetOnboarding).toHaveBeenCalledWith("user-456");
      expect(result).toBe(mockOnboarding);
    });
  });
});
