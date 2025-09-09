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
  mediaConfig,
} from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./shared/auth/auth.module";
import { HealthController } from "./shared/controllers/health.controller";
import { ShutdownModule } from "./shared/modules/shutdown.module";
import { MailModule } from "./shared/services/mail/mail.module";
import { MediaModule } from "./shared/services/media/media.module";
import { TenantModule } from "./tenant/tenant.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, emailConfig, jwtConfig, cookieConfig, mediaConfig],
    }),
    DatabaseModule,
    TenantModule,
    ShutdownModule,
    AuthModule,
    MailModule,
    MediaModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
