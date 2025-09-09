import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";
import { AppModule } from "../../app.module";
import { DatabaseSeeder } from "./index";

async function runSeeders() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Create a new DataSource instance
  const dataSource = new DataSource({
    type: "postgres",
    host: configService.getOrThrow<string>("database.host") || "localhost",
    port: configService.getOrThrow<number>("database.port") || parseInt("5432", 10),
    username: configService.getOrThrow<string>("database.username") || "postgres",
    password: configService.getOrThrow<string>("database.password") || "password",
    database: configService.getOrThrow<string>("database.name") || "g4a_portal",
    entities: ["src/database/entities/*.entity.ts"],
    synchronize: false,
    logging: true,
  });

  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log("Database connection established.");

    // Run the seeders
    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();

    console.log("All seeders completed successfully!");
  } catch (error) {
    console.error("Error running seeders:", error);
    process.exit(1);
  } finally {
    // Close the data source
    await dataSource.destroy();
    console.log("Database connection closed.");
  }
}

// Run the seeders if this file is executed directly
if (require.main === module) {
  runSeeders();
}

export { runSeeders };
