import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserType } from "../../../database/entities/user.entity";
import { Roles } from "../../../shared/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../shared/auth/guards/roles.guard";
import {
  AcceptInvitationDto,
  CreateTeacherInvitationDto,
  DeclineInvitationDto,
  InvitationListResponseDto,
  InvitationStatsDto,
  ResendInvitationDto,
  TeacherInvitationResponseDto,
  UpdateTeacherInvitationDto,
} from "./dto/teacher-invitation.dto";
import { TeacherInvitationService } from "./teacher-invitation.service";

@ApiTags("Teacher Invitations")
@Controller("teacher-invitations")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
export class TeacherInvitationController {
  constructor(private readonly teacherInvitationService: TeacherInvitationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new teacher invitation" })
  @ApiResponse({
    status: 201,
    description: "Invitation created successfully",
    type: TeacherInvitationResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "Conflict - user already exists or invitation already pending",
  })
  async createInvitation(
    @Body() createDto: CreateTeacherInvitationDto,
    @Request() req,
  ): Promise<TeacherInvitationResponseDto> {
    return this.teacherInvitationService.createInvitation(
      createDto,
      req.user.schoolId,
      req.user.id,
      req.user.tenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: "Get teacher invitations" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["pending", "accepted", "declined", "expired", "cancelled"],
  })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Invitations retrieved successfully",
    type: InvitationListResponseDto,
  })
  async getInvitations(@Query() filters: any, @Request() req): Promise<InvitationListResponseDto> {
    return this.teacherInvitationService.getInvitations(
      req.user.schoolId,
      req.user.tenantId,
      filters,
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Get invitation statistics" })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
    type: InvitationStatsDto,
  })
  async getStats(@Request() req): Promise<InvitationStatsDto> {
    return this.teacherInvitationService.getInvitationStats(req.user.schoolId, req.user.tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get invitation by ID" })
  @ApiResponse({
    status: 200,
    description: "Invitation retrieved successfully",
    type: TeacherInvitationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  async getInvitationById(
    @Param("id") id: string,
    @Request() req,
  ): Promise<TeacherInvitationResponseDto> {
    return this.teacherInvitationService.getInvitationById(
      id,
      req.user.schoolId,
      req.user.tenantId,
    );
  }

  @Put(":id")
  @ApiOperation({ summary: "Update invitation" })
  @ApiResponse({
    status: 200,
    description: "Invitation updated successfully",
    type: TeacherInvitationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  @ApiResponse({ status: 400, description: "Only pending invitations can be updated" })
  async updateInvitation(
    @Param("id") id: string,
    @Body() updateDto: UpdateTeacherInvitationDto,
    @Request() req,
  ): Promise<TeacherInvitationResponseDto> {
    return this.teacherInvitationService.updateInvitation(
      id,
      updateDto,
      req.user.schoolId,
      req.user.tenantId,
    );
  }

  @Post(":id/resend")
  @ApiOperation({ summary: "Resend invitation email" })
  @ApiResponse({
    status: 200,
    description: "Invitation resent successfully",
    type: TeacherInvitationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  @ApiResponse({ status: 400, description: "Only pending invitations can be resent" })
  async resendInvitation(
    @Param("id") id: string,
    @Body() resendDto: ResendInvitationDto,
    @Request() req,
  ): Promise<TeacherInvitationResponseDto> {
    return this.teacherInvitationService.resendInvitation(
      id,
      resendDto,
      req.user.schoolId,
      req.user.tenantId,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Cancel invitation" })
  @ApiResponse({
    status: 200,
    description: "Invitation cancelled successfully",
    type: TeacherInvitationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  @ApiResponse({ status: 400, description: "Invitation cannot be cancelled" })
  async cancelInvitation(
    @Param("id") id: string,
    @Request() req,
  ): Promise<TeacherInvitationResponseDto> {
    return this.teacherInvitationService.cancelInvitation(
      id,
      req.user.schoolId,
      req.user.tenantId,
      req.ip,
    );
  }
}

@ApiTags("Teacher Invitation Acceptance")
@Controller("invite/teacher")
export class TeacherInvitationAcceptanceController {
  constructor(private readonly teacherInvitationService: TeacherInvitationService) {}

  @Get()
  @ApiOperation({ summary: "Get invitation details by token" })
  @ApiQuery({ name: "token", required: true, type: String })
  @ApiResponse({
    status: 200,
    description: "Invitation details retrieved",
    type: TeacherInvitationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Invalid invitation token" })
  async getInvitationByToken(@Query("token") token: string): Promise<TeacherInvitationResponseDto> {
    return this.teacherInvitationService.getInvitationByToken(token);
  }

  @Post("accept")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Accept teacher invitation" })
  @ApiResponse({ status: 200, description: "Invitation accepted successfully" })
  @ApiResponse({ status: 400, description: "Invalid invitation or user already exists" })
  @ApiResponse({ status: 404, description: "Invalid invitation token" })
  async acceptInvitation(
    @Body() acceptDto: AcceptInvitationDto & { token: string },
    @Request() req,
  ): Promise<{ user: any; invitation: TeacherInvitationResponseDto }> {
    const { token, ...acceptData } = acceptDto;
    const clientInfo = req.ip || req.headers["user-agent"];

    return this.teacherInvitationService.acceptInvitation(token, acceptData, clientInfo);
  }

  @Post("decline")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Decline teacher invitation" })
  @ApiResponse({
    status: 200,
    description: "Invitation declined successfully",
    type: TeacherInvitationResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid invitation" })
  @ApiResponse({ status: 404, description: "Invalid invitation token" })
  async declineInvitation(
    @Body() declineDto: DeclineInvitationDto & { token: string },
    @Request() req,
  ): Promise<TeacherInvitationResponseDto> {
    const { token, ...declineData } = declineDto;
    const clientInfo = req.ip || req.headers["user-agent"];

    return this.teacherInvitationService.declineInvitation(token, declineData, clientInfo);
  }
}
