import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { School } from "../database/entities/school.entity";
import { Tenant } from "../database/entities/tenant.entity";
import { EventService } from "../shared/events/event.service";
import {
  TenantCreatedEvent,
  TenantDeletedEvent,
  TenantPermanentlyDeletedEvent,
} from "../shared/events/tenant.events";
import { TenantContext } from "../shared/interfaces/tenant-context.interface";
import { TenantDatabaseService } from "./tenant-database.service";

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly eventService: EventService,
  ) {}

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { subdomain, isActive: true },
    });
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { domain, isActive: true },
    });
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async getSchoolById(schoolId: string, tenantId: string): Promise<School | null> {
    return this.schoolRepository.findOne({
      where: { id: schoolId, tenantId, isActive: true },
    });
  }

  async getTenantContext(tenantId: string, schoolId?: string): Promise<TenantContext> {
    const tenant = await this.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    let school: School | undefined;
    if (schoolId) {
      const foundSchool = await this.schoolRepository.findOne({
        where: { id: schoolId, tenantId, isActive: true },
      });
      if (!foundSchool) {
        throw new NotFoundException(`School with ID ${schoolId} not found for tenant ${tenantId}`);
      }
      school = foundSchool;
    }

    return {
      tenant,
      school,
      databaseName: tenant.databaseName,
    };
  }

  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    this.logger.log(`🏗️ Creating new tenant: ${tenantData.name}`);

    try {
      // Generate database name if not provided
      if (!tenantData.databaseName) {
        tenantData.databaseName = this.tenantDatabaseService.generateDatabaseName(
          tenantData.name || "tenant",
          tenantData.id || "",
        );
      }

      // Create tenant record in master database
      const tenant = this.tenantRepository.create(tenantData);
      const savedTenant = await this.tenantRepository.save(tenant);
      this.logger.log(`✅ Tenant record created: ${savedTenant.id}`);

      // Publish tenant created event to trigger database setup
      const tenantCreatedEvent = new TenantCreatedEvent(savedTenant);
      await this.eventService.publish(tenantCreatedEvent);

      this.logger.log(`📤 Tenant created event published: ${savedTenant.name}`);
      return savedTenant;
    } catch (error) {
      this.logger.error(`❌ Failed to create tenant ${tenantData.name}:`, error);

      // If tenant was created but event publishing failed, clean up
      if (tenantData.id) {
        try {
          await this.tenantRepository.delete(tenantData.id);
          this.logger.log(
            `🧹 Cleaned up tenant record after failed event publishing: ${tenantData.id}`,
          );
        } catch (cleanupError) {
          this.logger.error(`❌ Failed to clean up tenant record:`, cleanupError);
        }
      }

      throw error;
    }
  }

  async updateTenant(id: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    await this.tenantRepository.update(id, tenantData);
    const updatedTenant = await this.findById(id);
    if (!updatedTenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return updatedTenant;
  }

  async deleteTenant(id: string): Promise<void> {
    this.logger.log(`🗑️ Deleting tenant: ${id}`);

    try {
      // Get tenant information before deletion
      const tenant = await this.findById(id);
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      // Soft delete the tenant record
      const result = await this.tenantRepository.update(id, { isActive: false });
      if (result.affected === 0) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      this.logger.log(`✅ Tenant record soft deleted: ${tenant.name}`);

      // Publish tenant deleted event
      const tenantDeletedEvent = new TenantDeletedEvent(tenant);
      await this.eventService.publish(tenantDeletedEvent);

      this.logger.log(`📤 Tenant deleted event published: ${tenant.name}`);
    } catch (error) {
      this.logger.error(`❌ Failed to delete tenant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Permanently delete a tenant and its database
   */
  async permanentlyDeleteTenant(id: string): Promise<void> {
    this.logger.log(`💀 Permanently deleting tenant: ${id}`);

    try {
      // Get tenant information before deletion
      const tenant = await this.findById(id);
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      // Drop the tenant database
      await this.tenantDatabaseService.dropTenantDatabase(tenant);
      this.logger.log(`✅ Tenant database dropped: ${tenant.databaseName}`);

      // Permanently delete the tenant record
      await this.tenantRepository.delete(id);
      this.logger.log(`✅ Tenant record permanently deleted: ${tenant.name}`);

      // Publish tenant permanently deleted event
      const tenantPermanentlyDeletedEvent = new TenantPermanentlyDeletedEvent(tenant);
      await this.eventService.publish(tenantPermanentlyDeletedEvent);

      this.logger.log(`📤 Tenant permanently deleted event published: ${tenant.name}`);
    } catch (error) {
      this.logger.error(`❌ Failed to permanently delete tenant ${id}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  }
}
