import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { HealthCheckService } from "../services/health-check.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getHealth() {
    const isHealthy = await this.healthCheckService.isHealthy();

    if (!isHealthy) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        message: "Application is not healthy",
      };
    }

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "Application is running normally",
    };
  }

  @Get("ready")
  @HttpCode(HttpStatus.OK)
  async getReadiness() {
    const isReady = await this.healthCheckService.isReady();

    if (!isReady) {
      return {
        status: "not ready",
        timestamp: new Date().toISOString(),
        message: "Application is not ready to accept requests",
      };
    }

    return {
      status: "ready",
      timestamp: new Date().toISOString(),
      message: "Application is ready to accept requests",
    };
  }

  @Get("detailed")
  @HttpCode(HttpStatus.OK)
  async getDetailedHealth() {
    const healthStatus = await this.healthCheckService.getHealthStatus();

    return {
      ...healthStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
