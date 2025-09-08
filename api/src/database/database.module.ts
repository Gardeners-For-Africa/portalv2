import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
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
        return {
          type: "postgres",
          url: dbConfig.masterDatabaseUrl,
          entities: [Tenant, School, User, Role, Permission],
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          migrationsRun: dbConfig.migrationsRun,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseManagerService],
  exports: [DatabaseManagerService],
})
export class DatabaseModule {}
