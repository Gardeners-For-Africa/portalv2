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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { JwtAuthGuard } from "../shared/auth/guards/jwt-auth.guard";
import {
  AuditFiltersDto,
  BulkModuleUpdateDto,
  CreateTenantModuleDto,
  DisableModuleDto,
  EnableModuleDto,
  ModuleFiltersDto,
  UpdateTenantModuleDto,
  ValidateModuleConfigurationDto,
} from "./dto/tenant-module.dto";
import { TenantModuleService } from "./tenant-module.service";

@Controller("tenant-modules")
@UseGuards(JwtAuthGuard)
export class TenantModuleController {
  constructor(private readonly tenantModuleService: TenantModuleService) {}

  // ===== SYSTEM MODULES =====

  @Get("system")
  async getSystemModules() {
    return this.tenantModuleService.getSystemModules();
  }

  @Get("system/:id")
  async getSystemModuleById(@Param("id") id: string) {
    return this.tenantModuleService.getSystemModuleById(id);
  }

  @Post("system")
  async createSystemModule(@Body() createDto: CreateTenantModuleDto) {
    return this.tenantModuleService.createSystemModule(createDto);
  }

  @Put("system/:id")
  async updateSystemModule(@Param("id") id: string, @Body() updateDto: UpdateTenantModuleDto) {
    return this.tenantModuleService.updateSystemModule(id, updateDto);
  }

  @Delete("system/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSystemModule(@Param("id") id: string) {
    return this.tenantModuleService.deleteSystemModule(id);
  }

  // ===== TENANT MODULE CONFIGURATION =====

  @Get("tenants/:tenantId/modules")
  async getTenantModules(@Param("tenantId") tenantId: string) {
    return this.tenantModuleService.getTenantModules(tenantId);
  }

  @Get("tenants/:tenantId/modules/config")
  async getTenantModuleConfig(@Param("tenantId") tenantId: string) {
    return this.tenantModuleService.getTenantModuleConfig(tenantId);
  }

  // ===== MODULE ASSIGNMENTS =====

  @Post("tenants/:tenantId/modules/enable")
  async enableModule(
    @Param("tenantId") tenantId: string,
    @Body() enableDto: EnableModuleDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.tenantModuleService.enableModule(tenantId, enableDto, userId);
  }

  @Post("tenants/:tenantId/modules/disable")
  async disableModule(
    @Param("tenantId") tenantId: string,
    @Body() disableDto: DisableModuleDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.tenantModuleService.disableModule(tenantId, disableDto, userId);
  }

  @Put("tenants/:tenantId/modules/bulk")
  async bulkUpdateModules(
    @Param("tenantId") tenantId: string,
    @Body() bulkDto: BulkModuleUpdateDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.tenantModuleService.bulkUpdateModules(tenantId, bulkDto, userId);
  }

  @Get("tenants/:tenantId/modules/assignments")
  async getTenantModuleAssignments(
    @Param("tenantId") tenantId: string,
    @Query() filters: ModuleFiltersDto,
  ) {
    return this.tenantModuleService.getTenantModuleAssignments(tenantId, filters);
  }

  @Get("tenants/:tenantId/modules/assignments/:assignmentId")
  async getTenantModuleAssignment(
    @Param("tenantId") tenantId: string,
    @Param("assignmentId") assignmentId: string,
  ) {
    // Implementation for getting specific assignment
    // This would be added to the service if needed
    throw new Error("Not implemented yet");
  }

  // ===== VALIDATION =====

  @Post("tenants/:tenantId/modules/validate")
  async validateModuleConfiguration(
    @Param("tenantId") tenantId: string,
    @Body() validateDto: ValidateModuleConfigurationDto,
  ) {
    return this.tenantModuleService.validateModuleConfiguration(tenantId, validateDto);
  }

  // ===== AUDIT LOGS =====

  @Get("tenants/:tenantId/modules/audit-logs")
  async getModuleAuditLogs(@Param("tenantId") tenantId: string, @Query() filters: AuditFiltersDto) {
    return this.tenantModuleService.getModuleAuditLogs(tenantId, filters);
  }

  // ===== STATISTICS =====

  @Get("stats")
  async getModuleStats() {
    return this.tenantModuleService.getModuleStats();
  }

  @Get("tenants/:tenantId/modules/stats")
  async getTenantModuleStats(@Param("tenantId") tenantId: string) {
    const modulesData = await this.tenantModuleService.getTenantModules(tenantId);

    return {
      totalModules: modulesData.stats.totalModules,
      enabledModules: modulesData.stats.enabledModules,
      disabledModules: modulesData.stats.disabledModules,
      categoryBreakdown: modulesData.stats.categoryBreakdown,
      recentChanges: [], // This would be implemented if needed
    };
  }

  // ===== EXPORT/IMPORT =====

  @Get("tenants/:tenantId/modules/export")
  async exportTenantModules(@Param("tenantId") tenantId: string, @Res() res: Response) {
    const modulesData = await this.tenantModuleService.getTenantModules(tenantId);

    const exportData = {
      tenantId: modulesData.tenantId,
      tenantName: modulesData.tenantName,
      modules: modulesData.config.enabledModules,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${modulesData.tenantName}-modules.json"`,
    );
    res.send(exportData);
  }

  @Post("tenants/:tenantId/modules/import")
  @UseInterceptors(FileInterceptor("file"))
  async importTenantModules(
    @Param("tenantId") tenantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const userId = req.user?.id;

    if (!file) {
      throw new Error("No file uploaded");
    }

    try {
      const importData = JSON.parse(file.buffer.toString());

      if (!importData.modules || !Array.isArray(importData.modules)) {
        throw new Error("Invalid import file format");
      }

      // Process imported modules
      const moduleIds = importData.modules.map((m: any) => m.moduleId);

      const bulkDto = {
        moduleIds,
        enabled: true,
        notes: `Imported from ${importData.tenantName || "unknown"} on ${importData.exportedAt || new Date().toISOString()}`,
      };

      return this.tenantModuleService.bulkUpdateModules(tenantId, bulkDto, userId);
    } catch (error) {
      throw new Error(`Failed to import modules: ${error.message}`);
    }
  }
}
