import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { Tenant } from "../database/entities/tenant.entity";

@Injectable()
export class TenantMigrationService {
  private readonly logger = new Logger(TenantMigrationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Run migrations for a specific tenant database
   */
  async runMigrations(tenant: Tenant): Promise<void> {
    const databaseName = tenant.databaseName;
    this.logger.log(`🔄 Running migrations for tenant: ${tenant.name} (${databaseName})`);

    try {
      // Create a temporary data source for running migrations
      const dataSourceOptions = this.getTenantDataSourceOptions(tenant);
      const dataSource = new DataSource(dataSourceOptions);

      // Initialize the data source
      await dataSource.initialize();
      this.logger.log(`✅ Connected to tenant database: ${databaseName}`);

      // Run migrations
      await dataSource.runMigrations();
      this.logger.log(`✅ Migrations completed for tenant: ${tenant.name}`);

      // Close the data source
      await dataSource.destroy();
      this.logger.log(`✅ Database connection closed for tenant: ${tenant.name}`);
    } catch (error) {
      this.logger.error(`❌ Failed to run migrations for tenant ${tenant.name}:`, error);
      throw error;
    }
  }

  /**
   * Check if migrations are needed for a tenant database
   */
  async needsMigration(tenant: Tenant): Promise<boolean> {
    try {
      const dataSourceOptions = this.getTenantDataSourceOptions(tenant);
      const dataSource = new DataSource(dataSourceOptions);

      await dataSource.initialize();

      // Check if there are pending migrations
      const pendingMigrations = await dataSource.showMigrations();

      await dataSource.destroy();

      return pendingMigrations;
    } catch (error) {
      this.logger.error(`❌ Failed to check migrations for tenant ${tenant.name}:`, error);
      return false;
    }
  }

  /**
   * Get tenant-specific data source options
   */
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
      entities: [
        // Import tenant-specific entities
        require("../database/entities/user.entity").User,
        require("../database/entities/role.entity").Role,
        require("../database/entities/permission.entity").Permission,
        require("../database/entities/school.entity").School,
      ],
      synchronize: false, // Always use migrations in production
      logging: dbConfig.logging,
      migrationsRun: false, // We'll run migrations manually
      migrations: [
        // Import tenant-specific migrations
        require("../migrations/1700000000001-CreateAuthTables").CreateAuthTables1700000000001,
      ],
    };
  }
}
