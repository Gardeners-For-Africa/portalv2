import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { DatabaseManagerService } from "../../tenant/database-manager.service";

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private isShuttingDown = false;

  constructor(private readonly databaseManager: DatabaseManagerService) {}

  /**
   * Check if the application is healthy
   */
  async isHealthy(): Promise<boolean> {
    if (this.isShuttingDown) {
      return false;
    }

    try {
      // Check master database connection
      const masterDataSource = this.databaseManager.getMasterDataSource();
      if (!masterDataSource || !masterDataSource.isInitialized) {
        this.logger.warn("⚠️ Master database connection is not initialized");
        return false;
      }

      // Test master database connection
      await masterDataSource.query("SELECT 1");

      return true;
    } catch (error) {
      this.logger.error("❌ Health check failed:", error);
      return false;
    }
  }

  /**
   * Check if the application is ready to accept requests
   */
  async isReady(): Promise<boolean> {
    return (await this.isHealthy()) && !this.isShuttingDown;
  }

  /**
   * Mark the application as shutting down
   */
  setShuttingDown(): void {
    this.isShuttingDown = true;
    this.logger.log("🛑 Application marked as shutting down");
  }

  /**
   * Check if the application is shutting down
   */
  isShuttingDownStatus(): boolean {
    return this.isShuttingDown;
  }

  /**
   * Get detailed health status
   */
  async getHealthStatus(): Promise<{
    healthy: boolean;
    ready: boolean;
    shuttingDown: boolean;
    databases: {
      master: boolean;
      tenants: number;
    };
  }> {
    const healthy = await this.isHealthy();
    const ready = await this.isReady();
    const shuttingDown = this.isShuttingDown;

    // Count active tenant databases
    const tenantDatabases = this.databaseManager.getActiveTenantDatabases?.() || 0;

    return {
      healthy,
      ready,
      shuttingDown,
      databases: {
        master: healthy,
        tenants: tenantDatabases,
      },
    };
  }
}
