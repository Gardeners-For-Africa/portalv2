import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { OnboardingStep } from "../../../../database/entities/user-onboarding.entity";

export class StepCompletionDto {
  @ApiProperty({
    description: "The onboarding step to complete",
    enum: OnboardingStep,
    example: OnboardingStep.ACCOUNT_CREATION,
  })
  @IsEnum(OnboardingStep)
  step: OnboardingStep;

  @ApiPropertyOptional({
    description: "Data associated with the step",
    type: "object",
    example: { firstName: "John", lastName: "Doe" },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Notes about the step completion",
    example: "Profile setup completed successfully",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AbandonOnboardingDto {
  @ApiPropertyOptional({
    description: "Reason for abandoning the onboarding process",
    example: "User decided to stop the process",
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RequireApprovalDto {
  @ApiPropertyOptional({
    description: "Notes about why approval is required",
    example: "School registration needs admin verification",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveOnboardingDto {
  @ApiPropertyOptional({
    description: "Notes about the approval",
    example: "Approved by school administrator",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OnboardingProgressResponseDto {
  @ApiProperty({
    description: "Unique identifier for the onboarding record",
    example: "onboarding-123",
  })
  id: string;

  @ApiProperty({
    description: "User ID associated with the onboarding",
    example: "user-123",
  })
  userId: string;

  @ApiProperty({
    description: "Current status of the onboarding process",
    enum: ["not_started", "in_progress", "completed", "abandoned", "requires_approval"],
    example: "in_progress",
  })
  status: string;

  @ApiProperty({
    description: "Current step in the onboarding process",
    enum: OnboardingStep,
    example: OnboardingStep.ACCOUNT_CREATION,
  })
  currentStep: OnboardingStep;

  @ApiProperty({
    description: "Array of completed steps",
    type: [String],
    example: [OnboardingStep.ACCOUNT_CREATION],
  })
  @IsArray()
  completedSteps: OnboardingStep[];

  @ApiProperty({
    description: "Progress percentage (0-100)",
    example: 25,
  })
  progressPercentage: number;

  @ApiPropertyOptional({
    description: "When the onboarding process started",
    example: "2024-01-01T00:00:00.000Z",
  })
  startedAt?: Date;

  @ApiPropertyOptional({
    description: "When the onboarding process was completed",
    example: "2024-01-01T00:00:00.000Z",
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: "When the last step was completed",
    example: "2024-01-01T00:00:00.000Z",
  })
  lastStepAt?: Date;

  @ApiProperty({
    description: "Whether the user can proceed to the current step",
    example: true,
  })
  canProceed: boolean;

  @ApiPropertyOptional({
    description: "Next step in the onboarding process",
    enum: OnboardingStep,
    example: OnboardingStep.EMAIL_VERIFICATION,
  })
  nextStep?: OnboardingStep;
}

export class OnboardingStatsResponseDto {
  @ApiProperty({
    description: "Total number of onboarding records",
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: "Number of completed onboardings",
    example: 50,
  })
  completed: number;

  @ApiProperty({
    description: "Number of onboardings in progress",
    example: 30,
  })
  inProgress: number;

  @ApiProperty({
    description: "Number of abandoned onboardings",
    example: 15,
  })
  abandoned: number;

  @ApiProperty({
    description: "Number of onboardings pending approval",
    example: 5,
  })
  pendingApproval: number;
}
