import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { TenantDatabaseService } from "../../../tenant/tenant-database.service";
import { EventService } from "../event.service";
import {
  TenantCreatedEvent,
  TenantDatabaseCreatedEvent,
  TenantSetupFailedEvent,
} from "../tenant.events";

@Injectable()
export class TenantDatabaseListener {
  private readonly logger = new Logger(TenantDatabaseListener.name);

  constructor(
    private readonly tenantDatabaseService: TenantDatabaseService,
    private readonly eventService: EventService,
  ) {}

  /**
   * Handle tenant created event - create database
   */
  @OnEvent("TenantCreatedEvent")
  async handleTenantCreated(event: TenantCreatedEvent): Promise<void> {
    this.logger.log(`🗄️ Handling tenant created event for: ${event.tenantName}`);

    try {
      // Create the tenant database
      await this.tenantDatabaseService.createTenantDatabase(event.tenant);

      // Publish database created event
      const databaseCreatedEvent = new TenantDatabaseCreatedEvent(event.tenant);
      await this.eventService.publish(databaseCreatedEvent);

      this.logger.log(`✅ Database created successfully for tenant: ${event.tenantName}`);
    } catch (error) {
      this.logger.error(`❌ Failed to create database for tenant ${event.tenantName}:`, error);

      // Publish setup failed event
      const setupFailedEvent = new TenantSetupFailedEvent(
        event.tenant,
        error.message,
        "database_creation",
      );
      await this.eventService.publish(setupFailedEvent);

      throw error;
    }
  }
}
