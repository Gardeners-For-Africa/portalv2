import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseInitializationService } from "../shared/services/database-initialization.service";
import { DatabaseManagerService } from "../tenant/database-manager.service";
import { Permission } from "./entities/permission.entity";
import { Role } from "./entities/role.entity";
import { School } from "./entities/school.entity";
import { Tenant } from "./entities/tenant.entity";
import { User } from "./entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get("database");

        // Debug logging for SSL configuration
        console.log("🔧 Database SSL Configuration:");
        console.log("  - DB_SSL:", configService.get("DB_SSL"));
        console.log(
          "  - DB_SSL_REJECT_UNAUTHORIZED:",
          configService.get("DB_SSL_REJECT_UNAUTHORIZED"),
        );
        console.log("  - dbConfig.ssl:", dbConfig.ssl);
        console.log("  - dbConfig.sslRejectUnauthorized:", dbConfig.sslRejectUnauthorized);

        // More robust SSL configuration
        // Check both the parsed config and raw environment variables
        const sslFromEnv = configService.get("DB_SSL");
        const sslFromConfig = dbConfig.ssl;
        const sslEnabled = sslFromEnv === "true" || sslFromEnv === true || sslFromConfig === true;

        const rejectUnauthorizedFromEnv = configService.get("DB_SSL_REJECT_UNAUTHORIZED");
        const rejectUnauthorizedFromConfig = dbConfig.sslRejectUnauthorized;
        const rejectUnauthorized =
          rejectUnauthorizedFromEnv !== "false" && rejectUnauthorizedFromConfig !== false;

        console.log("  - sslFromEnv:", sslFromEnv);
        console.log("  - sslFromConfig:", sslFromConfig);
        console.log("  - sslEnabled:", sslEnabled);
        console.log("  - rejectUnauthorizedFromEnv:", rejectUnauthorizedFromEnv);
        console.log("  - rejectUnauthorizedFromConfig:", rejectUnauthorizedFromConfig);
        console.log("  - rejectUnauthorized:", rejectUnauthorized);

        const sslConfig = sslEnabled
          ? {
              rejectUnauthorized: rejectUnauthorized,
            }
          : false;

        console.log("  - Final SSL config:", sslConfig);

        return {
          type: "postgres",
          url: dbConfig.masterDatabaseUrl,
          entities: [Tenant, School, User, Role, Permission],
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          migrationsRun: dbConfig.migrationsRun,
          autoLoadEntities: true,
          ssl: sslConfig,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseManagerService, DatabaseInitializationService],
  exports: [DatabaseManagerService, DatabaseInitializationService],
})
export class DatabaseModule {}
