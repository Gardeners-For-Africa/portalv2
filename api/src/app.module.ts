import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import {
  appConfig,
  cookieConfig,
  databaseConfig,
  emailConfig,
  jwtConfig,
} from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./shared/auth/auth.module";
import { ShutdownModule } from "./shared/modules/shutdown.module";
import { TenantModule } from "./tenant/tenant.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, emailConfig, jwtConfig, cookieConfig],
    }),
    DatabaseModule,
    TenantModule,
    ShutdownModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
