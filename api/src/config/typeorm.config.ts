import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource } from "typeorm";

// Load environment variables
config();

const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  url:
    configService.get("MASTER_DATABASE_URL") ||
    "postgresql://username:password@localhost:5432/g4a_master",
  entities: ["src/entities/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: true,
});
