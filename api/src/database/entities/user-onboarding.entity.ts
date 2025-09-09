import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum OnboardingStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
  REQUIRES_APPROVAL = "requires_approval",
}

export enum OnboardingStep {
  // Initial steps
  ACCOUNT_CREATION = "account_creation",
  EMAIL_VERIFICATION = "email_verification",
  PROFILE_SETUP = "profile_setup",

  // School-related steps
  SCHOOL_SELECTION = "school_selection",
  SCHOOL_REGISTRATION = "school_registration",
  SCHOOL_VERIFICATION = "school_verification",

  // Role-specific steps
  ROLE_SELECTION = "role_selection",
  PERMISSIONS_SETUP = "permissions_setup",

  // Final steps
  DASHBOARD_TOUR = "dashboard_tour",
  COMPLETION = "completion",
}

@Entity("user_onboarding")
@Index(["userId"], { unique: true })
@Index(["status"])
@Index(["currentStep"])
export class UserOnboarding {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({
    type: "enum",
    enum: OnboardingStatus,
    default: OnboardingStatus.NOT_STARTED,
  })
  status: OnboardingStatus;

  @Column({
    type: "enum",
    enum: OnboardingStep,
    default: OnboardingStep.ACCOUNT_CREATION,
  })
  currentStep: OnboardingStep;

  @Column({ type: "jsonb", default: "[]" })
  completedSteps: OnboardingStep[];

  @Column({ type: "jsonb", nullable: true })
  stepData: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  lastStepAt?: Date;

  @Column({ nullable: true })
  abandonedAt?: Date;

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get isCompleted(): boolean {
    return this.status === OnboardingStatus.COMPLETED;
  }

  get isInProgress(): boolean {
    return this.status === OnboardingStatus.IN_PROGRESS;
  }

  get isAbandoned(): boolean {
    return this.status === OnboardingStatus.ABANDONED;
  }

  get isPendingApproval(): boolean {
    return this.status === OnboardingStatus.REQUIRES_APPROVAL;
  }

  get progressPercentage(): number {
    if (this.completedSteps.length === 0) return 0;
    const totalSteps = Object.values(OnboardingStep).length;
    return Math.round((this.completedSteps.length / totalSteps) * 100);
  }

  hasCompletedStep(step: OnboardingStep): boolean {
    return this.completedSteps.includes(step);
  }

  canProceedToStep(step: OnboardingStep): boolean {
    // Define step dependencies
    const stepDependencies: Record<OnboardingStep, OnboardingStep[]> = {
      [OnboardingStep.ACCOUNT_CREATION]: [],
      [OnboardingStep.EMAIL_VERIFICATION]: [OnboardingStep.ACCOUNT_CREATION],
      [OnboardingStep.PROFILE_SETUP]: [OnboardingStep.EMAIL_VERIFICATION],
      [OnboardingStep.SCHOOL_SELECTION]: [OnboardingStep.PROFILE_SETUP],
      [OnboardingStep.SCHOOL_REGISTRATION]: [OnboardingStep.SCHOOL_SELECTION],
      [OnboardingStep.SCHOOL_VERIFICATION]: [OnboardingStep.SCHOOL_REGISTRATION],
      [OnboardingStep.ROLE_SELECTION]: [OnboardingStep.SCHOOL_SELECTION],
      [OnboardingStep.PERMISSIONS_SETUP]: [OnboardingStep.ROLE_SELECTION],
      [OnboardingStep.DASHBOARD_TOUR]: [OnboardingStep.PERMISSIONS_SETUP],
      [OnboardingStep.COMPLETION]: [OnboardingStep.DASHBOARD_TOUR],
    };

    const dependencies = stepDependencies[step] || [];
    return dependencies.every((dep) => this.hasCompletedStep(dep));
  }

  getNextStep(): OnboardingStep | null {
    const allSteps = Object.values(OnboardingStep);
    const currentIndex = allSteps.indexOf(this.currentStep);

    for (let i = currentIndex + 1; i < allSteps.length; i++) {
      const step = allSteps[i];
      if (this.canProceedToStep(step) && !this.hasCompletedStep(step)) {
        return step;
      }
    }

    return null;
  }

  getStepData(step: OnboardingStep): any {
    return this.stepData?.[step] || null;
  }

  setStepData(step: OnboardingStep, data: any): void {
    if (!this.stepData) {
      this.stepData = {};
    }
    this.stepData[step] = data;
  }

  completeStep(step: OnboardingStep): void {
    if (!this.hasCompletedStep(step)) {
      this.completedSteps.push(step);
    }
    this.lastStepAt = new Date();
  }

  start(): void {
    this.status = OnboardingStatus.IN_PROGRESS;
    this.startedAt = new Date();
  }

  complete(): void {
    this.status = OnboardingStatus.COMPLETED;
    this.completedAt = new Date();
  }

  abandon(): void {
    this.status = OnboardingStatus.ABANDONED;
    this.abandonedAt = new Date();
  }

  requireApproval(): void {
    this.status = OnboardingStatus.REQUIRES_APPROVAL;
  }

  approve(approvedBy: string): void {
    this.status = OnboardingStatus.COMPLETED;
    this.approvedAt = new Date();
    this.approvedBy = approvedBy;
  }
}
