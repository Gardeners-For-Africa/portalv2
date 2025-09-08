import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { DataSource } from "typeorm";
import { DatabaseManagerService } from "../../tenant/database-manager.service";
import { HealthCheckService } from "./health-check.service";

@Injectable()
export class GracefulShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(GracefulShutdownService.name);
  private shutdownHandlers: Array<() => Promise<void>> = [];
  private isShuttingDown = false;

  constructor(
    private readonly databaseManager: DatabaseManagerService,
    private readonly healthCheckService: HealthCheckService,
  ) {}

  /**
   * Register a shutdown handler
   */
  registerShutdownHandler(handler: () => Promise<void>): void {
    this.shutdownHandlers.push(handler);
  }

  /**
   * Execute all registered shutdown handlers
   */
  async executeShutdownHandlers(): Promise<void> {
    this.logger.log("🔄 Starting graceful shutdown...");

    const shutdownPromises = this.shutdownHandlers.map(async (handler, index) => {
      try {
        this.logger.log(
          `🔄 Executing shutdown handler ${index + 1}/${this.shutdownHandlers.length}`,
        );
        await handler();
        this.logger.log(`✅ Shutdown handler ${index + 1} completed successfully`);
      } catch (error) {
        this.logger.error(`❌ Shutdown handler ${index + 1} failed:`, error);
        // Don't throw here to ensure other handlers still execute
      }
    });

    await Promise.allSettled(shutdownPromises);
    this.logger.log("✅ All shutdown handlers completed");
  }

  /**
   * Graceful shutdown implementation
   */
  async gracefulShutdown(): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.warn("⚠️ Graceful shutdown already in progress, skipping...");
      return;
    }

    this.isShuttingDown = true;
    this.logger.log("🛑 Graceful shutdown initiated");

    try {
      // Mark application as shutting down
      this.healthCheckService.setShuttingDown();
      this.logger.log("🔄 Application marked as shutting down");

      // Close all tenant databases
      await this.databaseManager.closeAllDatabases();
      this.logger.log("✅ All tenant databases closed");

      // Execute any additional shutdown handlers
      await this.executeShutdownHandlers();

      this.logger.log("✅ Graceful shutdown completed successfully");
    } catch (error) {
      this.logger.error("❌ Error during graceful shutdown:", error);
      throw error;
    }
  }

  /**
   * Called when the module is being destroyed
   */
  async onModuleDestroy(): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.warn("⚠️ Module destruction already in progress, skipping...");
      return;
    }

    this.logger.log("🔄 GracefulShutdownService: Starting module cleanup...");

    try {
      // Only close databases, don't call gracefulShutdown to avoid circular calls
      await this.databaseManager.closeAllDatabases();
      this.logger.log("✅ GracefulShutdownService: Module cleanup completed");
    } catch (error) {
      this.logger.error("❌ Error during module cleanup:", error);
    }
  }
}
