import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../../database/entities/user.entity";
import {
  OnboardingStatus,
  OnboardingStep,
  UserOnboarding,
} from "../../../database/entities/user-onboarding.entity";

export interface OnboardingProgress {
  id: string;
  userId: string;
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  progressPercentage: number;
  startedAt?: Date;
  completedAt?: Date;
  lastStepAt?: Date;
  canProceed: boolean;
  nextStep?: OnboardingStep;
}

export interface StepCompletionData {
  step: OnboardingStep;
  data?: Record<string, any>;
  notes?: string;
}

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(UserOnboarding)
    private readonly onboardingRepository: Repository<UserOnboarding>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Initialize onboarding for a user
   */
  async initializeOnboarding(userId: string): Promise<UserOnboarding> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check if onboarding already exists
    const existingOnboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });

    if (existingOnboarding) {
      return existingOnboarding;
    }

    // Create new onboarding record
    const onboarding = this.onboardingRepository.create({
      userId,
      status: OnboardingStatus.NOT_STARTED,
      currentStep: OnboardingStep.ACCOUNT_CREATION,
      completedSteps: [],
      stepData: {},
    });

    return await this.onboardingRepository.save(onboarding);
  }

  /**
   * Start the onboarding process
   */
  async startOnboarding(userId: string): Promise<UserOnboarding> {
    const onboarding = await this.getOnboardingByUserId(userId);

    if (onboarding.status !== OnboardingStatus.NOT_STARTED) {
      throw new BadRequestException("Onboarding has already been started");
    }

    onboarding.start();
    return await this.onboardingRepository.save(onboarding);
  }

  /**
   * Complete a specific step
   */
  async completeStep(userId: string, stepData: StepCompletionData): Promise<UserOnboarding> {
    const onboarding = await this.getOnboardingByUserId(userId);

    if (onboarding.status !== OnboardingStatus.IN_PROGRESS) {
      throw new BadRequestException("Onboarding is not in progress");
    }

    if (!onboarding.canProceedToStep(stepData.step)) {
      throw new BadRequestException(
        `Cannot proceed to step ${stepData.step}. Prerequisites not met.`,
      );
    }

    // Set step data if provided
    if (stepData.data) {
      onboarding.setStepData(stepData.step, stepData.data);
    }

    // Complete the step
    onboarding.completeStep(stepData.step);
    onboarding.currentStep = stepData.step;

    // Check if this was the final step
    const nextStep = onboarding.getNextStep();
    if (!nextStep) {
      onboarding.complete();
    }

    return await this.onboardingRepository.save(onboarding);
  }

  /**
   * Get onboarding progress for a user
   */
  async getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
    const onboarding = await this.getOnboardingByUserId(userId);

    return {
      id: onboarding.id,
      userId: onboarding.userId,
      status: onboarding.status,
      currentStep: onboarding.currentStep,
      completedSteps: onboarding.completedSteps,
      progressPercentage: onboarding.progressPercentage,
      startedAt: onboarding.startedAt,
      completedAt: onboarding.completedAt,
      lastStepAt: onboarding.lastStepAt,
      canProceed: onboarding.canProceedToStep(onboarding.currentStep),
      nextStep: onboarding.getNextStep() || undefined,
    };
  }

  /**
   * Get onboarding by user ID
   */
  async getOnboardingByUserId(userId: string): Promise<UserOnboarding> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
      relations: ["user"],
    });

    if (!onboarding) {
      throw new NotFoundException("Onboarding record not found");
    }

    return onboarding;
  }

  /**
   * Abandon onboarding
   */
  async abandonOnboarding(userId: string, reason?: string): Promise<UserOnboarding> {
    const onboarding = await this.getOnboardingByUserId(userId);

    if (onboarding.status === OnboardingStatus.COMPLETED) {
      throw new BadRequestException("Cannot abandon completed onboarding");
    }

    onboarding.abandon();
    if (reason) {
      onboarding.notes = reason;
    }

    return await this.onboardingRepository.save(onboarding);
  }

  /**
   * Require approval for onboarding
   */
  async requireApproval(userId: string, notes?: string): Promise<UserOnboarding> {
    const onboarding = await this.getOnboardingByUserId(userId);

    onboarding.requireApproval();
    if (notes) {
      onboarding.notes = notes;
    }

    return await this.onboardingRepository.save(onboarding);
  }

  /**
   * Approve onboarding
   */
  async approveOnboarding(
    userId: string,
    approvedBy: string,
    notes?: string,
  ): Promise<UserOnboarding> {
    const onboarding = await this.getOnboardingByUserId(userId);

    if (onboarding.status !== OnboardingStatus.REQUIRES_APPROVAL) {
      throw new BadRequestException("Onboarding does not require approval");
    }

    onboarding.approve(approvedBy);
    if (notes) {
      onboarding.notes = notes;
    }

    return await this.onboardingRepository.save(onboarding);
  }

  /**
   * Get all onboardings requiring approval
   */
  async getOnboardingsRequiringApproval(): Promise<UserOnboarding[]> {
    return await this.onboardingRepository.find({
      where: { status: OnboardingStatus.REQUIRES_APPROVAL },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });
  }

  /**
   * Get onboarding statistics
   */
  async getOnboardingStats(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    abandoned: number;
    pendingApproval: number;
  }> {
    const [total, completed, inProgress, abandoned, pendingApproval] = await Promise.all([
      this.onboardingRepository.count(),
      this.onboardingRepository.count({ where: { status: OnboardingStatus.COMPLETED } }),
      this.onboardingRepository.count({ where: { status: OnboardingStatus.IN_PROGRESS } }),
      this.onboardingRepository.count({ where: { status: OnboardingStatus.ABANDONED } }),
      this.onboardingRepository.count({ where: { status: OnboardingStatus.REQUIRES_APPROVAL } }),
    ]);

    return {
      total,
      completed,
      inProgress,
      abandoned,
      pendingApproval,
    };
  }

  /**
   * Reset onboarding for a user
   */
  async resetOnboarding(userId: string): Promise<UserOnboarding> {
    const onboarding = await this.getOnboardingByUserId(userId);

    onboarding.status = OnboardingStatus.NOT_STARTED;
    onboarding.currentStep = OnboardingStep.ACCOUNT_CREATION;
    onboarding.completedSteps = [];
    onboarding.stepData = {};
    onboarding.startedAt = undefined;
    onboarding.completedAt = undefined;
    onboarding.lastStepAt = undefined;
    onboarding.abandonedAt = undefined;
    onboarding.approvedAt = undefined;
    onboarding.approvedBy = undefined;
    onboarding.notes = undefined;

    return await this.onboardingRepository.save(onboarding);
  }
}
