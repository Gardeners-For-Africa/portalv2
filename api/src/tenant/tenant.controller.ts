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
  UseGuards,
} from "@nestjs/common";
import { Tenant } from "../database/entities/tenant.entity";
import { CreateTenantDto, UpdateTenantDto } from "./dto/tenant.dto";
import { TenantService } from "./tenant.service";

@Controller("tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantService.createTenant(createTenantDto);
  }

  @Get()
  async getAllTenants(): Promise<Tenant[]> {
    // In a real application, you'd want pagination and filtering
    return this.tenantService.findAll();
  }

  @Get(":id")
  async getTenant(@Param("id") id: string): Promise<Tenant> {
    const tenant = await this.tenantService.findById(id);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    return tenant;
  }

  @Put(":id")
  async updateTenant(
    @Param("id") id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    return this.tenantService.updateTenant(id, updateTenantDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTenant(@Param("id") id: string): Promise<void> {
    return this.tenantService.deleteTenant(id);
  }
}
