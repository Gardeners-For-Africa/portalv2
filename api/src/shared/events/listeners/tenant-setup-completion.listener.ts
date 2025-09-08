import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EventService } from "../event.service";
import {
  TenantSeedersCompletedEvent,
  TenantSetupCompletedEvent,
  TenantSetupFailedEvent,
} from "../tenant.events";

@Injectable()
export class TenantSetupCompletionListener {
  private readonly logger = new Logger(TenantSetupCompletionListener.name);
  private readonly setupStartTimes = new Map<string, number>();

  constructor(private readonly eventService: EventService) {}

  /**
   * Track setup start time when tenant is created
   */
  @OnEvent("TenantCreatedEvent")
  handleTenantCreated(event: any): void {
    this.setupStartTimes.set(event.tenantId, Date.now());
    this.logger.log(`⏱️ Started tracking setup time for tenant: ${event.tenantName}`);
  }

  /**
   * Handle seeders completed event - complete setup
   */
  @OnEvent("TenantSeedersCompletedEvent")
  async handleSeedersCompleted(event: TenantSeedersCompletedEvent): Promise<void> {
    this.logger.log(`🎉 Handling seeders completed event for: ${event.tenantName}`);

    try {
      // Calculate setup duration
      const startTime = this.setupStartTimes.get(event.tenantId);
      const setupDuration = startTime ? Date.now() - startTime : 0;

      // Clean up tracking
      this.setupStartTimes.delete(event.tenantId);

      // Get the tenant object
      const tenant = {
        id: event.tenantId,
        name: event.tenantName,
        databaseName: event.databaseName,
      } as any;

      // Publish setup completed event
      const setupCompletedEvent = new TenantSetupCompletedEvent(tenant, setupDuration);
      await this.eventService.publish(setupCompletedEvent);

      this.logger.log(
        `🎉 Tenant setup completed successfully: ${event.tenantName} (${setupDuration}ms)`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to complete setup for tenant ${event.tenantName}:`, error);

      // Clean up tracking
      this.setupStartTimes.delete(event.tenantId);

      // Publish setup failed event
      const tenant = {
        id: event.tenantId,
        name: event.tenantName,
        databaseName: event.databaseName,
      } as any;

      const setupFailedEvent = new TenantSetupFailedEvent(tenant, error.message, "seeding");
      await this.eventService.publish(setupFailedEvent);
    }
  }

  /**
   * Handle setup failed event - cleanup tracking
   */
  @OnEvent("TenantSetupFailedEvent")
  handleSetupFailed(event: TenantSetupFailedEvent): void {
    this.logger.error(`❌ Setup failed for tenant ${event.tenantName} at stage: ${event.stage}`);

    // Clean up tracking
    this.setupStartTimes.delete(event.tenantId);
  }
}
