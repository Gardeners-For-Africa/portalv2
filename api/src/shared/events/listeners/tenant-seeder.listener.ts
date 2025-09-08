import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { TenantSeederService } from "../../../tenant/tenant-seeder.service";
import { EventService } from "../event.service";
import {
  TenantMigrationsCompletedEvent,
  TenantSeedersCompletedEvent,
  TenantSetupCompletedEvent,
  TenantSetupFailedEvent,
} from "../tenant.events";

@Injectable()
export class TenantSeederListener {
  private readonly logger = new Logger(TenantSeederListener.name);

  constructor(
    private readonly tenantSeederService: TenantSeederService,
    private readonly eventService: EventService,
  ) {}

  /**
   * Handle migrations completed event - run seeders
   */
  @OnEvent("TenantMigrationsCompletedEvent")
  async handleMigrationsCompleted(event: TenantMigrationsCompletedEvent): Promise<void> {
    this.logger.log(`🌱 Handling migrations completed event for: ${event.tenantName}`);

    try {
      // Get the tenant object (you might need to fetch this from the database)
      const tenant = {
        id: event.tenantId,
        name: event.tenantName,
        databaseName: event.databaseName,
      } as any;

      // Run seeders
      await this.tenantSeederService.runSeeders(tenant);
      this.logger.log(`✅ Seeders completed for tenant: ${event.tenantName}`);

      // Publish seeders completed event
      const seedersCompletedEvent = new TenantSeedersCompletedEvent(tenant, 0);
      await this.eventService.publish(seedersCompletedEvent);
    } catch (error) {
      this.logger.error(`❌ Failed to run seeders for tenant ${event.tenantName}:`, error);

      // Publish setup failed event
      const tenant = {
        id: event.tenantId,
        name: event.tenantName,
        databaseName: event.databaseName,
      } as any;

      const setupFailedEvent = new TenantSetupFailedEvent(tenant, error.message, "seeding");
      await this.eventService.publish(setupFailedEvent);

      throw error;
    }
  }
}
