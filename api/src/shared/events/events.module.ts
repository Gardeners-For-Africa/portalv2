import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TenantDatabaseService } from "../../tenant/tenant-database.service";
import { TenantMigrationService } from "../../tenant/tenant-migration.service";
import { TenantSeederService } from "../../tenant/tenant-seeder.service";
import { EventService } from "./event.service";
import { TenantDatabaseListener } from "./listeners/tenant-database.listener";
import { TenantMigrationListener } from "./listeners/tenant-migration.listener";
import { TenantSeederListener } from "./listeners/tenant-seeder.listener";
import { TenantSetupCompletionListener } from "./listeners/tenant-setup-completion.listener";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Set this to `true` to use wildcards
      wildcard: false,
      // The delimiter used to segment namespaces
      delimiter: ".",
      // Set this to `true` if you want to emit the newListener event
      newListener: false,
      // Set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // The maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // Show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // Disable throwing uncaughtException if an error is not handled
      ignoreErrors: false,
    }),
  ],
  providers: [
    EventService,
    TenantDatabaseListener,
    TenantMigrationListener,
    TenantSeederListener,
    TenantSetupCompletionListener,
    TenantDatabaseService,
    TenantMigrationService,
    TenantSeederService,
  ],
  exports: [EventService],
})
export class EventsModule {}
