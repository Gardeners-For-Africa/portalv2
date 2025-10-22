import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import { Permission } from "../database/entities/permission.entity";
import { Role } from "../database/entities/role.entity";
import { School } from "../database/entities/school.entity";
import { Tenant } from "../database/entities/tenant.entity";
import { User } from "../database/entities/user.entity";

// Load environment variables
config();

const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  url:
    configService.get("MASTER_DATABASE_URL") ||
    "postgresql://username:password@localhost:5432/g4a_master",
  entities: [Tenant, School, User, Role, Permission],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
  logging: true,
  ssl: configService.get("DB_SSL")
    ? {
        rejectUnauthorized: configService.get("DB_SSL_REJECT_UNAUTHORIZED") !== false,
      }
    : false,
});
