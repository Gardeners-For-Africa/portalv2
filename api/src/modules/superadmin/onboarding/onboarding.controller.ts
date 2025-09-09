import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserType } from "../../../database/entities/user.entity";
import { Roles } from "../../../shared/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../shared/auth/guards/roles.guard";
import {
  AbandonOnboardingDto,
  ApproveOnboardingDto,
  OnboardingProgressResponseDto,
  OnboardingStatsResponseDto,
  RequireApprovalDto,
  StepCompletionDto,
} from "./dto/onboarding.dto";
import { OnboardingProgress, OnboardingService, StepCompletionData } from "./onboarding.service";

@ApiTags("Onboarding")
@Controller("onboarding")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post("initialize")
  @ApiOperation({ summary: "Initialize onboarding for the current user" })
  @ApiResponse({ status: 201, description: "Onboarding initialized successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "User not found" })
  async initializeOnboarding(@Request() req: any) {
    return await this.onboardingService.initializeOnboarding(req.user.id);
  }

  @Post("start")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Start the onboarding process" })
  @ApiResponse({ status: 200, description: "Onboarding started successfully" })
  @ApiResponse({ status: 400, description: "Onboarding already started" })
  async startOnboarding(@Request() req: any) {
    return await this.onboardingService.startOnboarding(req.user.id);
  }

  @Put("step")
  @ApiOperation({ summary: "Complete a specific onboarding step" })
  @ApiResponse({ status: 200, description: "Step completed successfully" })
  @ApiResponse({ status: 400, description: "Invalid step or prerequisites not met" })
  async completeStep(@Request() req: any, @Body() stepData: StepCompletionDto) {
    return await this.onboardingService.completeStep(req.user.id, stepData);
  }

  @Get("progress")
  @ApiOperation({ summary: "Get current onboarding progress" })
  @ApiResponse({
    status: 200,
    description: "Onboarding progress retrieved successfully",
    type: OnboardingProgressResponseDto,
  })
  async getProgress(@Request() req: any): Promise<OnboardingProgress> {
    return await this.onboardingService.getOnboardingProgress(req.user.id);
  }

  @Post("abandon")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Abandon the onboarding process" })
  @ApiResponse({ status: 200, description: "Onboarding abandoned successfully" })
  @ApiResponse({ status: 400, description: "Cannot abandon completed onboarding" })
  async abandonOnboarding(@Request() req: any, @Body() body: AbandonOnboardingDto) {
    return await this.onboardingService.abandonOnboarding(req.user.id, body.reason);
  }

  @Post("require-approval")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark onboarding as requiring approval" })
  @ApiResponse({ status: 200, description: "Approval required successfully" })
  async requireApproval(@Request() req: any, @Body() body: RequireApprovalDto) {
    return await this.onboardingService.requireApproval(req.user.id, body.notes);
  }

  @Post("approve/:userId")
  @UseGuards(RolesGuard)
  @Roles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @ApiOperation({ summary: "Approve user onboarding (Admin only)" })
  @ApiResponse({ status: 200, description: "Onboarding approved successfully" })
  @ApiResponse({ status: 400, description: "Onboarding does not require approval" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async approveOnboarding(
    @Param("userId") userId: string,
    @Request() req: any,
    @Body() body: ApproveOnboardingDto,
  ) {
    return await this.onboardingService.approveOnboarding(userId, req.user.id, body.notes);
  }

  @Get("pending-approval")
  @UseGuards(RolesGuard)
  @Roles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @ApiOperation({ summary: "Get onboardings requiring approval (Admin only)" })
  @ApiResponse({ status: 200, description: "Pending approvals retrieved successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async getPendingApprovals() {
    return await this.onboardingService.getOnboardingsRequiringApproval();
  }

  @Get("stats")
  @UseGuards(RolesGuard)
  @Roles(UserType.SUPER_ADMIN)
  @ApiOperation({ summary: "Get onboarding statistics (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
    type: OnboardingStatsResponseDto,
  })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async getStats() {
    return await this.onboardingService.getOnboardingStats();
  }

  @Post("reset/:userId")
  @UseGuards(RolesGuard)
  @Roles(UserType.SUPER_ADMIN)
  @ApiOperation({ summary: "Reset user onboarding (Super Admin only)" })
  @ApiResponse({ status: 200, description: "Onboarding reset successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async resetOnboarding(@Param("userId") userId: string) {
    return await this.onboardingService.resetOnboarding(userId);
  }
}
