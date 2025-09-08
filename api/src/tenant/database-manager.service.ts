import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { Tenant } from "../database/entities/tenant.entity";

@Injectable()
export class DatabaseManagerService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseManagerService.name);
  private readonly dataSources = new Map<string, DataSource>();

  constructor(private readonly configService: ConfigService) {}

  async createTenantDatabase(tenant: Tenant): Promise<void> {
    const databaseName = tenant.databaseName;

    if (this.dataSources.has(databaseName)) {
      this.logger.log(`Database connection for ${databaseName} already exists`);
      return;
    }

    try {
      const dataSourceOptions = this.getTenantDataSourceOptions(tenant);
      const dataSource = new DataSource(dataSourceOptions);

      await dataSource.initialize();
      this.dataSources.set(databaseName, dataSource);

      this.logger.log(`Created database connection for tenant: ${tenant.name} (${databaseName})`);
    } catch (error) {
      this.logger.error(`Failed to create database for tenant ${tenant.name}:`, error);
      throw error;
    }
  }

  async getTenantDataSource(databaseName: string): Promise<DataSource> {
    const dataSource = this.dataSources.get(databaseName);
    if (!dataSource) {
      throw new Error(`Database connection for ${databaseName} not found`);
    }
    return dataSource;
  }

  async closeTenantDatabase(databaseName: string): Promise<void> {
    const dataSource = this.dataSources.get(databaseName);
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      this.dataSources.delete(databaseName);
      this.logger.log(`Closed database connection for ${databaseName}`);
    }
  }

  async closeAllDatabases(): Promise<void> {
    const closePromises = Array.from(this.dataSources.entries()).map(async ([name, dataSource]) => {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
        this.logger.log(`Closed database connection for ${name}`);
      }
    });

    await Promise.all(closePromises);
    this.dataSources.clear();
  }

  private getTenantDataSourceOptions(tenant: Tenant): DataSourceOptions {
    const dbConfig = this.configService.get("database");

    // Parse the master database URL to get connection details
    const masterUrl = new URL(dbConfig.masterDatabaseUrl);

    return {
      type: "postgres",
      host: masterUrl.hostname,
      port: parseInt(masterUrl.port, 10) || 5432,
      username: masterUrl.username,
      password: masterUrl.password,
      database: tenant.databaseName,
      entities: [], // Will be populated by the tenant module
      synchronize: dbConfig.synchronize,
      logging: dbConfig.logging,
      migrationsRun: dbConfig.migrationsRun,
    };
  }

  getMasterDataSourceOptions(): DataSourceOptions {
    const dbConfig = this.configService.get("database");

    return {
      type: "postgres",
      url: dbConfig.masterDatabaseUrl,
      entities: [Tenant], // Only tenant management entities in master DB
      synchronize: dbConfig.synchronize,
      logging: dbConfig.logging,
      migrationsRun: dbConfig.migrationsRun,
    };
  }

  /**
   * Get the master data source (for health checks)
   */
  getMasterDataSource(): DataSource | null {
    // This would need to be injected from the DatabaseModule
    // For now, return null as the master connection is managed by TypeORM
    return null;
  }

  /**
   * Get count of active tenant databases
   */
  getActiveTenantDatabases(): number {
    return this.dataSources.size;
  }

  /**
   * Called when the module is being destroyed
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log("🔄 DatabaseManagerService: Starting cleanup...");
    await this.closeAllDatabases();
    this.logger.log("✅ DatabaseManagerService: Cleanup completed");
  }
}
