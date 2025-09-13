import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, In, Repository } from "typeorm";
import { Tenant } from "../database/entities/tenant.entity";
import { TenantModule } from "../database/entities/tenant-module.entity";
import { TenantModuleAssignment } from "../database/entities/tenant-module-assignment.entity";
import {
  ModuleAuditAction,
  TenantModuleAudit,
} from "../database/entities/tenant-module-audit.entity";
import { User } from "../database/entities/user.entity";
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

@Injectable()
export class TenantModuleService {
  constructor(
    @InjectRepository(TenantModule)
    private readonly tenantModuleRepository: Repository<TenantModule>,
    @InjectRepository(TenantModuleAssignment)
    private readonly assignmentRepository: Repository<TenantModuleAssignment>,
    @InjectRepository(TenantModuleAudit)
    private readonly auditRepository: Repository<TenantModuleAudit>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ===== SYSTEM MODULES =====

  async getSystemModules(): Promise<TenantModule[]> {
    return this.tenantModuleRepository.find({
      where: { isSystemModule: true, isActive: true },
      order: { order: "ASC", name: "ASC" },
    });
  }

  async getSystemModuleById(id: string): Promise<TenantModule | null> {
    return this.tenantModuleRepository.findOne({
      where: { id, isSystemModule: true },
    });
  }

  async createSystemModule(createDto: CreateTenantModuleDto): Promise<TenantModule> {
    const existingModule = await this.tenantModuleRepository.findOne({
      where: { code: createDto.code },
    });

    if (existingModule) {
      throw new BadRequestException(`Module with code '${createDto.code}' already exists`);
    }

    const module = this.tenantModuleRepository.create({
      ...createDto,
      isSystemModule: true,
    });

    return this.tenantModuleRepository.save(module);
  }

  async updateSystemModule(id: string, updateDto: UpdateTenantModuleDto): Promise<TenantModule> {
    const module = await this.getSystemModuleById(id);
    if (!module) {
      throw new NotFoundException(`System module with ID '${id}' not found`);
    }

    Object.assign(module, updateDto);
    return this.tenantModuleRepository.save(module);
  }

  async deleteSystemModule(id: string): Promise<void> {
    const module = await this.getSystemModuleById(id);
    if (!module) {
      throw new NotFoundException(`System module with ID '${id}' not found`);
    }

    // Check if module is assigned to any tenants
    const assignments = await this.assignmentRepository.count({
      where: { moduleId: id },
    });

    if (assignments > 0) {
      throw new BadRequestException(
        `Cannot delete module '${module.name}' as it is assigned to ${assignments} tenant(s)`,
      );
    }

    await this.tenantModuleRepository.remove(module);
  }

  // ===== TENANT MODULE CONFIGURATION =====

  async getTenantModules(tenantId: string): Promise<any> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${tenantId}' not found`);
    }

    const systemModules = await this.getSystemModules();
    const assignments = await this.assignmentRepository.find({
      where: { tenantId },
      relations: ["module", "enabledByUser", "disabledByUser"],
    });

    const enabledModules = assignments.filter((a) => a.isEnabled);
    const disabledModules = assignments.filter((a) => !a.isEnabled);

    const categoryBreakdown = systemModules.reduce(
      (acc, module) => {
        const assignment = assignments.find((a) => a.moduleId === module.id);
        const isEnabled = assignment?.isEnabled || false;

        if (!acc[module.category]) {
          acc[module.category] = { enabled: 0, total: 0 };
        }
        acc[module.category].total++;
        if (isEnabled) {
          acc[module.category].enabled++;
        }
        return acc;
      },
      {} as Record<string, { enabled: number; total: number }>,
    );

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      config: {
        id: `config-${tenantId}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        enabledModules: enabledModules.map((a) => ({
          id: a.id,
          tenantId: a.tenantId,
          tenantName: tenant.name,
          moduleId: a.moduleId,
          moduleCode: a.module.code,
          moduleName: a.module.name,
          isEnabled: a.isEnabled,
          enabledAt: a.enabledAt?.toISOString(),
          enabledBy: a.enabledBy,
          enabledByName: a.enabledByUser?.fullName || "System",
          notes: a.notes,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        })),
        totalModules: systemModules.length,
        enabledCount: enabledModules.length,
        lastUpdated: new Date().toISOString(),
        updatedBy: "system",
        updatedByName: "System",
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString(),
      },
      availableModules: systemModules,
      stats: {
        totalModules: systemModules.length,
        enabledModules: enabledModules.length,
        disabledModules: disabledModules.length,
        categoryBreakdown,
      },
    };
  }

  async getTenantModuleConfig(tenantId: string): Promise<any> {
    const assignments = await this.assignmentRepository.find({
      where: { tenantId },
      relations: ["module"],
    });

    return {
      id: `config-${tenantId}`,
      tenantId,
      enabledModules: assignments.map((a) => ({
        id: a.id,
        tenantId: a.tenantId,
        moduleId: a.moduleId,
        moduleCode: a.module.code,
        moduleName: a.module.name,
        isEnabled: a.isEnabled,
        enabledAt: a.enabledAt?.toISOString(),
        enabledBy: a.enabledBy,
        notes: a.notes,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    };
  }

  // ===== MODULE ASSIGNMENTS =====

  async enableModule(
    tenantId: string,
    enableDto: EnableModuleDto,
    userId: string,
  ): Promise<TenantModuleAssignment> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${tenantId}' not found`);
    }

    const module = await this.getSystemModuleById(enableDto.moduleId);
    if (!module) {
      throw new NotFoundException(`Module with ID '${enableDto.moduleId}' not found`);
    }

    // Check if already assigned
    let assignment = await this.assignmentRepository.findOne({
      where: { tenantId, moduleId: enableDto.moduleId },
      relations: ["module"],
    });

    if (assignment && assignment.isEnabled) {
      throw new BadRequestException(`Module '${module.name}' is already enabled for this tenant`);
    }

    if (assignment) {
      // Update existing assignment
      assignment.isEnabled = true;
      assignment.enabledAt = new Date();
      assignment.enabledBy = userId;
      assignment.disabledAt = null as any;
      assignment.disabledBy = null as any;
      assignment.notes = enableDto.notes || "";
      assignment.configuration = enableDto.configuration || {};
    } else {
      // Create new assignment
      assignment = this.assignmentRepository.create({
        tenantId,
        moduleId: enableDto.moduleId,
        isEnabled: true,
        enabledAt: new Date(),
        enabledBy: userId,
        notes: enableDto.notes || "",
        configuration: enableDto.configuration || {},
      });
    }

    const savedAssignment = await this.assignmentRepository.save(assignment);

    // Create audit log
    await this.createAuditLog(tenantId, enableDto.moduleId, ModuleAuditAction.ENABLED, userId, {
      enabled: true,
      notes: enableDto.notes,
    });

    // Update tenant modules array
    await this.updateTenantModulesArray(tenantId);

    return savedAssignment;
  }

  async disableModule(
    tenantId: string,
    disableDto: DisableModuleDto,
    userId: string,
  ): Promise<TenantModuleAssignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { tenantId, moduleId: disableDto.moduleId },
      relations: ["module"],
    });

    if (!assignment) {
      throw new NotFoundException(
        `Module assignment for tenant '${tenantId}' and module '${disableDto.moduleId}' not found`,
      );
    }

    if (!assignment.isEnabled) {
      throw new BadRequestException(`Module '${assignment.module.name}' is already disabled`);
    }

    assignment.isEnabled = false;
    assignment.disabledAt = new Date();
    assignment.disabledBy = userId;
    assignment.enabledAt = null as any;
    assignment.enabledBy = null as any;
    assignment.reason = disableDto.reason || "";

    const savedAssignment = await this.assignmentRepository.save(assignment);

    // Create audit log
    await this.createAuditLog(tenantId, disableDto.moduleId, ModuleAuditAction.DISABLED, userId, {
      enabled: false,
      reason: disableDto.reason,
    });

    // Update tenant modules array
    await this.updateTenantModulesArray(tenantId);

    return savedAssignment;
  }

  async bulkUpdateModules(
    tenantId: string,
    bulkDto: BulkModuleUpdateDto,
    userId: string,
  ): Promise<TenantModuleAssignment[]> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${tenantId}' not found`);
    }

    const modules = await this.tenantModuleRepository.find({
      where: { id: In(bulkDto.moduleIds) },
    });

    if (modules.length !== bulkDto.moduleIds.length) {
      throw new BadRequestException("One or more module IDs are invalid");
    }

    const results: TenantModuleAssignment[] = [];

    for (const moduleId of bulkDto.moduleIds) {
      try {
        if (bulkDto.enabled) {
          const result = await this.enableModule(
            tenantId,
            { moduleId, notes: bulkDto.notes },
            userId,
          );
          results.push(result);
        } else {
          const result = await this.disableModule(
            tenantId,
            { moduleId, reason: bulkDto.notes },
            userId,
          );
          results.push(result);
        }
      } catch (error) {
        // Log error but continue with other modules
        console.error(`Error processing module ${moduleId}:`, error.message);
      }
    }

    return results;
  }

  // ===== MODULE ASSIGNMENTS QUERIES =====

  async getTenantModuleAssignments(
    tenantId: string,
    filters: ModuleFiltersDto,
  ): Promise<{
    assignments: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.assignmentRepository
      .createQueryBuilder("assignment")
      .leftJoinAndSelect("assignment.module", "module")
      .leftJoinAndSelect("assignment.enabledByUser", "enabledByUser")
      .leftJoinAndSelect("assignment.disabledByUser", "disabledByUser")
      .where("assignment.tenantId = :tenantId", { tenantId });

    if (filters.category) {
      query.andWhere("module.category = :category", { category: filters.category });
    }

    if (filters.isEnabled !== undefined) {
      query.andWhere("assignment.isEnabled = :isEnabled", { isEnabled: filters.isEnabled });
    }

    if (filters.search) {
      query.andWhere("(module.name ILIKE :search OR module.description ILIKE :search)", {
        search: `%${filters.search}%`,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query.skip(offset).take(limit).orderBy("assignment.createdAt", "DESC");

    const [assignments, total] = await query.getManyAndCount();

    return {
      assignments: assignments.map((a) => ({
        id: a.id,
        tenantId: a.tenantId,
        tenantName: a.tenant?.name,
        moduleId: a.moduleId,
        moduleCode: a.module.code,
        moduleName: a.module.name,
        isEnabled: a.isEnabled,
        enabledAt: a.enabledAt?.toISOString(),
        enabledBy: a.enabledBy,
        enabledByName: a.enabledByUser?.fullName || "System",
        disabledAt: a.disabledAt?.toISOString(),
        disabledBy: a.disabledBy,
        disabledByName: a.disabledByUser?.fullName || "System",
        notes: a.notes,
        reason: a.reason,
        configuration: a.configuration,
        metadata: a.metadata,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===== VALIDATION =====

  async validateModuleConfiguration(
    tenantId: string,
    validateDto: ValidateModuleConfigurationDto,
  ): Promise<{
    isValid: boolean;
    conflicts: Array<{
      moduleId: string;
      conflictType: "dependency" | "exclusion" | "limit";
      message: string;
    }>;
    suggestions: string[];
  }> {
    const modules = await this.tenantModuleRepository.find({
      where: { id: In(validateDto.moduleIds) },
    });

    const conflicts: Array<{
      moduleId: string;
      conflictType: "dependency" | "exclusion" | "limit";
      message: string;
    }> = [];

    const suggestions: string[] = [];

    for (const module of modules) {
      // Check dependencies
      if (module.dependencies && module.dependencies.length > 0) {
        const missingDependencies = module.dependencies.filter(
          (dep) => !validateDto.moduleIds.includes(dep),
        );

        if (missingDependencies.length > 0) {
          conflicts.push({
            moduleId: module.id,
            conflictType: "dependency",
            message: `Module '${module.name}' requires: ${missingDependencies.join(", ")}`,
          });

          suggestions.push(`Add missing dependencies: ${missingDependencies.join(", ")}`);
        }
      }

      // Check exclusions
      if (module.exclusions && module.exclusions.length > 0) {
        const conflictingModules = module.exclusions.filter((excl) =>
          validateDto.moduleIds.includes(excl),
        );

        if (conflictingModules.length > 0) {
          conflicts.push({
            moduleId: module.id,
            conflictType: "exclusion",
            message: `Module '${module.name}' conflicts with: ${conflictingModules.join(", ")}`,
          });

          suggestions.push(`Remove conflicting modules: ${conflictingModules.join(", ")}`);
        }
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      suggestions,
    };
  }

  // ===== AUDIT LOGS =====

  async getModuleAuditLogs(
    tenantId: string,
    filters: AuditFiltersDto,
  ): Promise<{
    logs: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.auditRepository
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.module", "module")
      .leftJoinAndSelect("audit.user", "user")
      .where("audit.tenantId = :tenantId", { tenantId });

    if (filters.moduleId) {
      query.andWhere("audit.moduleId = :moduleId", { moduleId: filters.moduleId });
    }

    if (filters.action) {
      query.andWhere("audit.action = :action", { action: filters.action });
    }

    if (filters.userId) {
      query.andWhere("audit.userId = :userId", { userId: filters.userId });
    }

    if (filters.dateFrom) {
      query.andWhere("audit.createdAt >= :dateFrom", { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      query.andWhere("audit.createdAt <= :dateTo", { dateTo: filters.dateTo });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query.skip(offset).take(limit).orderBy("audit.createdAt", "DESC");

    const [logs, total] = await query.getManyAndCount();

    return {
      logs: logs.map((log) => ({
        id: log.id,
        moduleId: log.moduleId,
        moduleName: log.module?.name,
        action: log.action,
        userId: log.userId,
        userName: log.user?.fullName || "System",
        changes: log.changes,
        notes: log.notes,
        metadata: log.metadata,
        timestamp: log.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===== STATISTICS =====

  async getModuleStats(): Promise<any> {
    const [totalModules, totalAssignments, enabledAssignments] = await Promise.all([
      this.tenantModuleRepository.count({ where: { isSystemModule: true } }),
      this.assignmentRepository.count(),
      this.assignmentRepository.count({ where: { isEnabled: true } }),
    ]);

    const categoryStats = await this.tenantModuleRepository
      .createQueryBuilder("module")
      .select("module.category", "category")
      .addSelect("COUNT(*)", "count")
      .where("module.isSystemModule = :isSystemModule", { isSystemModule: true })
      .groupBy("module.category")
      .getRawMany();

    const mostUsedModules = await this.assignmentRepository
      .createQueryBuilder("assignment")
      .leftJoinAndSelect("assignment.module", "module")
      .select("assignment.moduleId", "moduleId")
      .addSelect("module.name", "moduleName")
      .addSelect("COUNT(*)", "tenantCount")
      .where("assignment.isEnabled = :isEnabled", { isEnabled: true })
      .groupBy("assignment.moduleId, module.name")
      .orderBy("COUNT(*)", "DESC")
      .limit(10)
      .getRawMany();

    const recentChanges = await this.auditRepository
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.tenant", "tenant")
      .leftJoinAndSelect("audit.module", "module")
      .leftJoinAndSelect("audit.user", "user")
      .select([
        "audit.tenantId",
        "tenant.name",
        "audit.moduleId",
        "module.name",
        "audit.action",
        "audit.createdAt",
        "user.fullName",
      ])
      .orderBy("audit.createdAt", "DESC")
      .limit(20)
      .getMany();

    return {
      totalModules,
      enabledModules: enabledAssignments,
      disabledModules: totalAssignments - enabledAssignments,
      mostUsedModules,
      categoryBreakdown: categoryStats.reduce(
        (acc, stat) => {
          acc[stat.category] = parseInt(stat.count, 10);
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentChanges: recentChanges.map((change) => ({
        tenantId: change.tenantId,
        tenantName: change.tenant?.name,
        moduleId: change.moduleId,
        moduleName: change.module?.name,
        action: change.action,
        timestamp: change.createdAt.toISOString(),
        updatedBy: change.user?.fullName || "System",
      })),
    };
  }

  // ===== HELPER METHODS =====

  private async createAuditLog(
    tenantId: string,
    moduleId: string,
    action: ModuleAuditAction,
    userId: string,
    changes: Record<string, any>,
    notes?: string,
  ): Promise<TenantModuleAudit> {
    const auditLog = this.auditRepository.create({
      tenantId,
      moduleId,
      action,
      userId,
      changes,
      notes,
    });

    return this.auditRepository.save(auditLog);
  }

  private async updateTenantModulesArray(tenantId: string): Promise<void> {
    const assignments = await this.assignmentRepository.find({
      where: { tenantId },
      relations: ["module"],
    });

    const modulesArray = assignments.map((assignment) => ({
      moduleId: assignment.moduleId,
      moduleCode: assignment.module.code,
      moduleName: assignment.module.name,
      isEnabled: assignment.isEnabled,
      enabledAt: assignment.enabledAt?.toISOString(),
      enabledBy: assignment.enabledBy,
      notes: assignment.notes,
    }));

    await this.tenantRepository.update(tenantId, {
      modules: modulesArray,
    });
  }
}
