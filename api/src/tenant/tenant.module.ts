import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { School } from "../database/entities/school.entity";
import { Tenant } from "../database/entities/tenant.entity";
import { TenantModule as TenantModuleEntity } from "../database/entities/tenant-module.entity";
import { TenantModuleAssignment } from "../database/entities/tenant-module-assignment.entity";
import { TenantModuleAudit } from "../database/entities/tenant-module-audit.entity";
import { User } from "../database/entities/user.entity";
import { EventsModule } from "../shared/events/events.module";
import { DatabaseManagerService } from "./database-manager.service";
import { TenantController } from "./tenant.controller";
import { TenantGuard } from "./tenant.guard";
import { TenantService } from "./tenant.service";
import { TenantAwareController } from "./tenant-aware.controller";
import { TenantDatabaseService } from "./tenant-database.service";
import { TenantMigrationService } from "./tenant-migration.service";
import { TenantModuleController } from "./tenant-module.controller";
import { TenantModuleService } from "./tenant-module.service";
import { TenantModuleSeederService } from "./tenant-module-seeder.service";
import { TenantSeederService } from "./tenant-seeder.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      School,
      TenantModuleEntity,
      TenantModuleAssignment,
      TenantModuleAudit,
      User,
    ]),
    EventsModule,
  ],
  controllers: [TenantController, TenantAwareController, TenantModuleController],
  providers: [
    TenantService,
    DatabaseManagerService,
    TenantDatabaseService,
    TenantMigrationService,
    TenantSeederService,
    TenantGuard,
    TenantModuleService,
    TenantModuleSeederService,
  ],
  exports: [
    TenantService,
    DatabaseManagerService,
    TenantDatabaseService,
    TenantMigrationService,
    TenantSeederService,
    TenantGuard,
    TenantModuleService,
    TenantModuleSeederService,
  ],
})
export class TenantModule {}
