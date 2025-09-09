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
import {
  SchoolRegistrationStatus,
  SchoolType,
} from "../../../database/entities/school-registration.entity";
import { UserType } from "../../../database/entities/user.entity";
import { Roles } from "../../../shared/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../shared/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../shared/auth/guards/roles.guard";
import { SchoolRegistrationDataDto } from "./dto/school-registration.dto";
import type { SchoolRegistrationFilters } from "./school-registration.service";
import { SchoolRegistrationService } from "./school-registration.service";

@ApiTags("School Registration")
@Controller("school-registrations")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.SUPER_ADMIN)
@ApiBearerAuth()
export class SchoolRegistrationController {
  constructor(private readonly registrationService: SchoolRegistrationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new school registration" })
  @ApiResponse({ status: 201, description: "School registration created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "School code or email already exists" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async createRegistration(@Body() data: SchoolRegistrationDataDto, @Request() req: any) {
    return await this.registrationService.createRegistration(req.user.tenantId, data);
  }

  @Get()
  @ApiOperation({ summary: "Get all school registrations with filters and pagination" })
  @ApiQuery({ name: "status", required: false, enum: SchoolRegistrationStatus })
  @ApiQuery({ name: "schoolType", required: false, enum: SchoolType })
  @ApiQuery({ name: "tenantId", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "reviewedBy", required: false, type: String })
  @ApiQuery({ name: "approvedBy", required: false, type: String })
  @ApiQuery({ name: "dateFrom", required: false, type: Date })
  @ApiQuery({ name: "dateTo", required: false, type: Date })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: "School registrations retrieved successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async getRegistrations(
    @Query("status") status?: SchoolRegistrationStatus,
    @Query("schoolType") schoolType?: SchoolType,
    @Query("tenantId") tenantId?: string,
    @Query("search") search?: string,
    @Query("reviewedBy") reviewedBy?: string,
    @Query("approvedBy") approvedBy?: string,
    @Query("dateFrom") dateFrom?: Date,
    @Query("dateTo") dateTo?: Date,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    const filters: SchoolRegistrationFilters = {
      status,
      schoolType,
      tenantId,
      search,
      reviewedBy,
      approvedBy,
      dateFrom,
      dateTo,
    };

    return await this.registrationService.getRegistrations(filters, page, limit);
  }

  @Get("search")
  @ApiOperation({ summary: "Search school registrations" })
  @ApiQuery({ name: "q", required: true, type: String, description: "Search query" })
  @ApiQuery({ name: "status", required: false, enum: SchoolRegistrationStatus })
  @ApiQuery({ name: "schoolType", required: false, enum: SchoolType })
  @ApiQuery({ name: "tenantId", required: false, type: String })
  @ApiResponse({ status: 200, description: "Search results retrieved successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async searchRegistrations(
    @Query("q") query: string,
    @Query("status") status?: SchoolRegistrationStatus,
    @Query("schoolType") schoolType?: SchoolType,
    @Query("tenantId") tenantId?: string,
  ) {
    const filters: Omit<SchoolRegistrationFilters, "search"> = {
      status,
      schoolType,
      tenantId,
    };

    return await this.registrationService.searchRegistrations(query, filters);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get school registration statistics" })
  @ApiResponse({ status: 200, description: "Statistics retrieved successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async getStats() {
    return await this.registrationService.getRegistrationStats();
  }

  @Get("by-status/:status")
  @ApiOperation({ summary: "Get school registrations by status" })
  @ApiResponse({ status: 200, description: "Registrations retrieved successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async getRegistrationsByStatus(@Param("status") status: SchoolRegistrationStatus) {
    return await this.registrationService.getRegistrationsByStatus(status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get school registration by ID" })
  @ApiResponse({ status: 200, description: "School registration retrieved successfully" })
  @ApiResponse({ status: 404, description: "School registration not found" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async getRegistrationById(@Param("id") id: string) {
    return await this.registrationService.getRegistrationById(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update school registration" })
  @ApiResponse({ status: 200, description: "School registration updated successfully" })
  @ApiResponse({ status: 400, description: "Only pending registrations can be updated" })
  @ApiResponse({ status: 404, description: "School registration not found" })
  @ApiResponse({ status: 409, description: "School code or email already exists" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async updateRegistration(
    @Param("id") id: string,
    @Body() data: Partial<SchoolRegistrationDataDto>,
  ) {
    return await this.registrationService.updateRegistration(id, data);
  }

  @Post(":id/start-review")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Start review process for school registration" })
  @ApiResponse({ status: 200, description: "Review started successfully" })
  @ApiResponse({ status: 400, description: "School registration cannot be reviewed" })
  @ApiResponse({ status: 404, description: "School registration not found" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async startReview(@Param("id") id: string, @Request() req: any) {
    return await this.registrationService.startReview(id, req.user.id);
  }

  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Approve school registration" })
  @ApiResponse({ status: 200, description: "School registration approved successfully" })
  @ApiResponse({ status: 400, description: "School registration cannot be approved" })
  @ApiResponse({ status: 404, description: "School registration or school not found" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async approveRegistration(
    @Param("id") id: string,
    @Body() body: { schoolId: string; notes?: string },
    @Request() req: any,
  ) {
    return await this.registrationService.approveRegistration(
      id,
      req.user.id,
      body.schoolId,
      body.notes,
    );
  }

  @Post(":id/reject")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reject school registration" })
  @ApiResponse({ status: 200, description: "School registration rejected successfully" })
  @ApiResponse({ status: 400, description: "School registration cannot be rejected" })
  @ApiResponse({ status: 404, description: "School registration not found" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async rejectRegistration(
    @Param("id") id: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    return await this.registrationService.rejectRegistration(id, req.user.id, body.reason);
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel school registration" })
  @ApiResponse({ status: 200, description: "School registration cancelled successfully" })
  @ApiResponse({ status: 400, description: "School registration cannot be cancelled" })
  @ApiResponse({ status: 404, description: "School registration not found" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async cancelRegistration(
    @Param("id") id: string,
    @Body() body: { reason?: string },
    @Request() req: any,
  ) {
    return await this.registrationService.cancelRegistration(id, req.user.id, body.reason);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete school registration" })
  @ApiResponse({ status: 200, description: "School registration deleted successfully" })
  @ApiResponse({ status: 400, description: "Approved registrations cannot be deleted" })
  @ApiResponse({ status: 404, description: "School registration not found" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async deleteRegistration(@Param("id") id: string) {
    await this.registrationService.deleteRegistration(id);
    return { message: "School registration deleted successfully" };
  }
}
