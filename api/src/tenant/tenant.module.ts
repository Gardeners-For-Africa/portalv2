import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { School } from "../database/entities/school.entity";
import { Tenant } from "../database/entities/tenant.entity";
import { EventsModule } from "../shared/events/events.module";
import { DatabaseManagerService } from "./database-manager.service";
import { TenantController } from "./tenant.controller";
import { TenantGuard } from "./tenant.guard";
import { TenantService } from "./tenant.service";
import { TenantAwareController } from "./tenant-aware.controller";
import { TenantDatabaseService } from "./tenant-database.service";
import { TenantMigrationService } from "./tenant-migration.service";
import { TenantSeederService } from "./tenant-seeder.service";

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, School]), EventsModule],
  controllers: [TenantController, TenantAwareController],
  providers: [
    TenantService,
    DatabaseManagerService,
    TenantDatabaseService,
    TenantMigrationService,
    TenantSeederService,
    TenantGuard,
  ],
  exports: [
    TenantService,
    DatabaseManagerService,
    TenantDatabaseService,
    TenantMigrationService,
    TenantSeederService,
    TenantGuard,
  ],
})
export class TenantModule {}
