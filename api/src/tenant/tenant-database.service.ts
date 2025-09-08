import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { Tenant } from "../database/entities/tenant.entity";

@Injectable()
export class TenantDatabaseService {
  private readonly logger = new Logger(TenantDatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Create a new database for a tenant
   */
  async createTenantDatabase(tenant: Tenant): Promise<void> {
    const databaseName = tenant.databaseName;
    this.logger.log(`🗄️ Creating database for tenant: ${tenant.name} (${databaseName})`);

    try {
      // Create a connection to the master database to create the new database
      const masterDataSource = await this.getMasterDataSource();

      // Check if database already exists
      const databaseExists = await this.databaseExists(masterDataSource, databaseName);

      if (databaseExists) {
        this.logger.warn(`⚠️ Database ${databaseName} already exists for tenant ${tenant.name}`);
        return;
      }

      // Create the database
      await this.createDatabase(masterDataSource, databaseName);
      this.logger.log(`✅ Database ${databaseName} created successfully`);

      // Close the master connection
      await masterDataSource.destroy();
    } catch (error) {
      this.logger.error(`❌ Failed to create database for tenant ${tenant.name}:`, error);
      throw error;
    }
  }

  /**
   * Drop a tenant database
   */
  async dropTenantDatabase(tenant: Tenant): Promise<void> {
    const databaseName = tenant.databaseName;
    this.logger.log(`🗑️ Dropping database for tenant: ${tenant.name} (${databaseName})`);

    try {
      // Create a connection to the master database to drop the database
      const masterDataSource = await this.getMasterDataSource();

      // Check if database exists
      const databaseExists = await this.databaseExists(masterDataSource, databaseName);

      if (!databaseExists) {
        this.logger.warn(`⚠️ Database ${databaseName} does not exist for tenant ${tenant.name}`);
        return;
      }

      // Drop the database
      await this.dropDatabase(masterDataSource, databaseName);
      this.logger.log(`✅ Database ${databaseName} dropped successfully`);

      // Close the master connection
      await masterDataSource.destroy();
    } catch (error) {
      this.logger.error(`❌ Failed to drop database for tenant ${tenant.name}:`, error);
      throw error;
    }
  }

  /**
   * Check if a database exists
   */
  async checkDatabaseExists(tenant: Tenant): Promise<boolean> {
    try {
      const masterDataSource = await this.getMasterDataSource();
      const exists = await this.databaseExists(masterDataSource, tenant.databaseName);
      await masterDataSource.destroy();
      return exists;
    } catch (error) {
      this.logger.error(`❌ Failed to check if database exists for tenant ${tenant.name}:`, error);
      return false;
    }
  }

  /**
   * Get master database connection
   */
  private async getMasterDataSource(): Promise<DataSource> {
    const dbConfig = this.configService.get("database");

    const masterDataSource = new DataSource({
      type: "postgres",
      url: dbConfig.masterDatabaseUrl,
      entities: [], // No entities needed for database creation
      synchronize: false,
      logging: false,
    });

    await masterDataSource.initialize();
    return masterDataSource;
  }

  /**
   * Check if a database exists (internal method)
   */
  private async databaseExists(dataSource: DataSource, databaseName: string): Promise<boolean> {
    const result = await dataSource.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      databaseName,
    ]);
    return result.length > 0;
  }

  /**
   * Create a new database
   */
  private async createDatabase(dataSource: DataSource, databaseName: string): Promise<void> {
    // Create the database
    await dataSource.query(`CREATE DATABASE "${databaseName}"`);

    // Set default privileges for the database
    const dbConfig = this.configService.get("database");
    const masterUrl = new URL(dbConfig.masterDatabaseUrl);
    const username = masterUrl.username;

    // Grant all privileges on the new database to the user
    await dataSource.query(`GRANT ALL PRIVILEGES ON DATABASE "${databaseName}" TO "${username}"`);
  }

  /**
   * Drop a database
   */
  private async dropDatabase(dataSource: DataSource, databaseName: string): Promise<void> {
    // Terminate all connections to the database before dropping
    await dataSource.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
    `,
      [databaseName],
    );

    // Drop the database
    await dataSource.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
  }

  /**
   * Generate a unique database name for a tenant
   */
  generateDatabaseName(tenantName: string, tenantId: string): string {
    const dbConfig = this.configService.get("database");
    const prefix = dbConfig.namePrefix;

    // Clean the tenant name to be database-safe
    const cleanName = tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .substring(0, 20); // Limit length

    // Add tenant ID for uniqueness
    const shortId = tenantId.substring(0, 8);

    return `${prefix}${cleanName}_${shortId}`;
  }
}
