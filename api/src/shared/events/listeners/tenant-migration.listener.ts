import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { TenantMigrationService } from "../../../tenant/tenant-migration.service";
import { EventService } from "../event.service";
import {
  TenantDatabaseCreatedEvent,
  TenantMigrationsCompletedEvent,
  TenantSetupFailedEvent,
} from "../tenant.events";

@Injectable()
export class TenantMigrationListener {
  private readonly logger = new Logger(TenantMigrationListener.name);

  constructor(
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly eventService: EventService,
  ) {}

  /**
   * Handle database created event - run migrations
   */
  @OnEvent("TenantDatabaseCreatedEvent")
  async handleDatabaseCreated(event: TenantDatabaseCreatedEvent): Promise<void> {
    this.logger.log(`🔄 Handling database created event for: ${event.tenantName}`);

    try {
      // Get the tenant object (you might need to fetch this from the database)
      const tenant = {
        id: event.tenantId,
        name: event.tenantName,
        databaseName: event.databaseName,
      } as any;

      // Check if migrations are needed
      const needsMigration = await this.tenantMigrationService.needsMigration(tenant);

      if (needsMigration) {
        // Run migrations
        await this.tenantMigrationService.runMigrations(tenant);
        this.logger.log(`✅ Migrations completed for tenant: ${event.tenantName}`);
      } else {
        this.logger.log(`ℹ️ No migrations needed for tenant: ${event.tenantName}`);
      }

      // Publish migrations completed event
      const migrationsCompletedEvent = new TenantMigrationsCompletedEvent(tenant, 0);
      await this.eventService.publish(migrationsCompletedEvent);
    } catch (error) {
      this.logger.error(`❌ Failed to run migrations for tenant ${event.tenantName}:`, error);

      // Publish setup failed event
      const tenant = {
        id: event.tenantId,
        name: event.tenantName,
        databaseName: event.databaseName,
      } as any;

      const setupFailedEvent = new TenantSetupFailedEvent(tenant, error.message, "migrations");
      await this.eventService.publish(setupFailedEvent);

      throw error;
    }
  }
}
