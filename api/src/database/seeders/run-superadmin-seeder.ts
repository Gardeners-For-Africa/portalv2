import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";
import { AppModule } from "../../app.module";
import { SuperadminSeeder } from "./superadmin.seeder";

async function runSuperadminSeeder() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Create a new DataSource instance
  const dataSource = new DataSource({
    type: "postgres",
    url:
      configService.get("MASTER_DATABASE_URL") ||
      "postgresql://username:password@localhost:5432/g4a_master",
    entities: ["src/database/entities/*.entity.ts"],
    synchronize: false,
    logging: true,
  });

  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log("Database connection established.");

    // Run the superadmin seeder
    const seeder = new SuperadminSeeder(dataSource);
    await seeder.run();

    console.log("Superadmin seeder completed successfully!");
  } catch (error) {
    console.error("Error running superadmin seeder:", error);
    process.exit(1);
  } finally {
    // Close the data source
    await dataSource.destroy();
    console.log("Database connection closed.");
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  runSuperadminSeeder();
}
