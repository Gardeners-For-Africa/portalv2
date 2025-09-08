import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { School } from "../database/entities/school.entity";
import { Tenant } from "../database/entities/tenant.entity";
import { TenantContext } from "../shared/interfaces/tenant-context.interface";

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
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
    const tenant = this.tenantRepository.create(tenantData);
    return this.tenantRepository.save(tenant);
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
    const result = await this.tenantRepository.update(id, { isActive: false });
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  }
}
