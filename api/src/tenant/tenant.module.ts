import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { School } from "../database/entities/school.entity";
import { Tenant } from "../database/entities/tenant.entity";
import { DatabaseManagerService } from "./database-manager.service";
import { TenantController } from "./tenant.controller";
import { TenantGuard } from "./tenant.guard";
import { TenantService } from "./tenant.service";
import { TenantAwareController } from "./tenant-aware.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, School])],
  controllers: [TenantController, TenantAwareController],
  providers: [TenantService, DatabaseManagerService, TenantGuard],
  exports: [TenantService, DatabaseManagerService, TenantGuard],
})
export class TenantModule {}
