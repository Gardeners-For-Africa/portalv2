import { Module } from "@nestjs/common";
import { DatabaseManagerService } from "../../tenant/database-manager.service";
import { HealthController } from "../controllers/health.controller";
import { GracefulShutdownService } from "../services/graceful-shutdown.service";
import { HealthCheckService } from "../services/health-check.service";

@Module({
  controllers: [HealthController],
  providers: [GracefulShutdownService, HealthCheckService, DatabaseManagerService],
  exports: [GracefulShutdownService, HealthCheckService],
})
export class ShutdownModule {}
