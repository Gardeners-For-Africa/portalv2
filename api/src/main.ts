import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./shared/filters/all-exceptions.filter";
import { ErrorInterceptor } from "./shared/interceptors/error.interceptor";
import { LoggingInterceptor } from "./shared/interceptors/logging.interceptor";
import { ResponseInterceptor } from "./shared/interceptors/response.interceptor";
import { TimeoutInterceptor } from "./shared/interceptors/timeout.interceptor";
import { GracefulShutdownService } from "./shared/services/graceful-shutdown.service";

const applogger = new Logger("G4APortalApplication");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const gracefulShutdownService = app.get(GracefulShutdownService);
  const port = configService.getOrThrow<number>("app.port");

  /**
   * Set up global prefix
   */
  app.setGlobalPrefix("api/v1", {
    exclude: ["/", "/api/docs", "/health", "/health/ready", "/health/detailed"],
  });

  /**
   * Set up CORS
   */
  app.enableCors({
    origin: configService.get("app.corsOrigin"),
    credentials: true,
  });

  /**
   * Setup Interceptors
   */
  app.useGlobalInterceptors(new LoggingInterceptor());

  /**
   * Setup Filters
   */
  app.useGlobalFilters(new AllExceptionsFilter());

  /**
   * Setup Response Interceptor
   */
  app.useGlobalInterceptors(new ResponseInterceptor());

  /**
   * Setup Timeout Interceptor
   */
  app.useGlobalInterceptors(new TimeoutInterceptor());

  /**
   * Setup Error Interceptor
   */
  app.useGlobalInterceptors(new ErrorInterceptor());

  /**
   * Setup Validation Pipes
   */
  app.useGlobalPipes(new ValidationPipe());

  /**
   * Setup Swagger Documentation
   */
  const config = new DocumentBuilder()
    .setTitle("G4A School Management Portal API")
    .setDescription(
      "A comprehensive multi-tenant school management system API with authentication, role-based access control, and tenant isolation.",
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addCookieAuth("accessToken", {
      type: "apiKey",
      in: "cookie",
      name: "accessToken",
      description: "Access token stored in HTTP-only cookie",
    })
    .addTag("Authentication", "User authentication and authorization endpoints")
    .addTag("Tenants", "Multi-tenant management endpoints")
    .addTag("Health", "Application health and monitoring endpoints")
    .addServer(`http://localhost:${port}`, "Development server")
    .addServer("https://api.g4a-school.com", "Production server")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
    customSiteTitle: "G4A School Portal API Documentation",
    customfavIcon: "/favicon.ico",
    customCss: ".swagger-ui .topbar { display: none }",
  });

  applogger.log("📚 Swagger documentation available at /api/docs");

  /**
   * Enable graceful shutdown
   */
  app.enableShutdownHooks();

  /**
   * Register shutdown handlers
   */
  gracefulShutdownService.registerShutdownHandler(async () => {
    applogger.log("🔄 Closing HTTP server...");
    await app.close();
    applogger.log("✅ HTTP server closed");
  });

  /**
   * Start the application
   */
  await app.listen(port, () => {
    applogger.log(`🚀 G4A School Management Portal Server is running on port ${port}`);
  });

  /**
   * Setup signal handlers for graceful shutdown
   */
  setupGracefulShutdown(gracefulShutdownService);
}

/**
 * Setup graceful shutdown signal handlers
 */
function setupGracefulShutdown(gracefulShutdownService: GracefulShutdownService): void {
  const signals = ["SIGTERM", "SIGINT", "SIGUSR2"];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      applogger.log(`🛑 Received ${signal}, starting graceful shutdown...`);

      try {
        // Set a timeout for graceful shutdown (30 seconds)
        const shutdownPromise = gracefulShutdownService.gracefulShutdown();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Shutdown timeout")), 30000);
        });

        await Promise.race([shutdownPromise, timeoutPromise]);
        applogger.log(`✅ Graceful shutdown completed for ${signal}`);
        process.exit(0);
      } catch (error) {
        applogger.error(`❌ Error during graceful shutdown for ${signal}:`, error);
        process.exit(1);
      }
    });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", async (error) => {
    applogger.error("❌ Uncaught Exception:", error);
    try {
      const shutdownPromise = gracefulShutdownService.gracefulShutdown();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Emergency shutdown timeout")), 10000);
      });
      await Promise.race([shutdownPromise, timeoutPromise]);
    } catch (shutdownError) {
      applogger.error("❌ Error during emergency shutdown:", shutdownError);
    }
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", async (reason, promise) => {
    applogger.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    try {
      const shutdownPromise = gracefulShutdownService.gracefulShutdown();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Emergency shutdown timeout")), 10000);
      });
      await Promise.race([shutdownPromise, timeoutPromise]);
    } catch (shutdownError) {
      applogger.error("❌ Error during emergency shutdown:", shutdownError);
    }
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  applogger.error("❌ Error starting the application:", error);
  process.exit(1);
});
