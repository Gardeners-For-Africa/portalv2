import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { DatabaseSeeder } from "../../database/seeders";

@Injectable()
export class DatabaseInitializationService {
  private readonly logger = new Logger(DatabaseInitializationService.name);

  constructor(private readonly configService: ConfigService) {}

  async initializeDatabase(): Promise<void> {
    this.logger.log("🔧 Starting database initialization...");

    try {
      // Create a minimal DataSource for seeding only (no migrations)
      const dataSource = new DataSource({
        type: "postgres",
        url:
          this.configService.get("database.masterDatabaseUrl") ||
          "postgresql://username:password@localhost:5432/g4a_master",
        entities: [], // No entities needed for seeding
        synchronize: false,
        logging: false,
      });

      try {
        await dataSource.initialize();
        this.logger.log("✅ Database connection established");

        // Check if seeders need to be run
        const needsSeeding = await this.checkIfSeedingNeeded(dataSource);

        if (needsSeeding) {
          this.logger.log("🌱 Running database seeders...");
          const seeder = new DatabaseSeeder(dataSource);
          await seeder.run();
          this.logger.log("✅ Database seeding completed successfully");
        } else {
          this.logger.log("ℹ️  Database already seeded");
        }
      } finally {
        await dataSource.destroy();
        this.logger.log("🔌 Database connection closed");
      }

      this.logger.log("🎉 Database initialization completed successfully");
      this.logger.log(
        "📝 Note: Run 'yarn migration:run' manually if you need to apply database migrations",
      );
    } catch (error) {
      this.logger.error("❌ Database initialization failed:", error);
      throw error;
    }
  }

  private async checkIfSeedingNeeded(dataSource: DataSource): Promise<boolean> {
    try {
      // Check if the permissions table exists and has data
      const permissionsCount = await dataSource.query("SELECT COUNT(*) as count FROM permissions");
      const adminCount = await dataSource.query(
        "SELECT COUNT(*) as count FROM users WHERE \"userType\" = 'super_admin'",
      );

      // If permissions table is empty or no super admin exists, we need to seed
      return (
        permissionsCount[0]?.count === "0" ||
        permissionsCount[0]?.count === 0 ||
        adminCount[0]?.count === "0" ||
        adminCount[0]?.count === 0
      );
    } catch (error) {
      // If the query fails (table doesn't exist), we need to seed
      this.logger.log("ℹ️  Permissions table not found, seeding required");
      return true;
    }
  }
}
