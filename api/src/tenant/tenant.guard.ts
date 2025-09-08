import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { RequestWithTenant } from "../shared/interfaces/tenant-context.interface";
import { DatabaseManagerService } from "./database-manager.service";
import { TenantService } from "./tenant.service";

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly databaseManager: DatabaseManagerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    try {
      // Extract tenant information from request
      const tenantInfo = this.extractTenantInfo(request);

      if (!tenantInfo) {
        throw new UnauthorizedException("Tenant information not found");
      }

      // Find tenant by subdomain or domain
      let tenant = tenantInfo.subdomain
        ? await this.tenantService.findBySubdomain(tenantInfo.subdomain)
        : null;
      if (!tenant && tenantInfo.domain) {
        tenant = await this.tenantService.findByDomain(tenantInfo.domain);
      }

      if (!tenant) {
        throw new UnauthorizedException(
          `Tenant not found: ${tenantInfo.subdomain || tenantInfo.domain}`,
        );
      }

      // Ensure tenant database is available
      await this.databaseManager.createTenantDatabase(tenant);

      // Set tenant context on request
      request.tenant = tenant;
      request.tenantContext = {
        tenant,
        databaseName: tenant.databaseName,
      };

      // Extract school information if provided
      if (tenantInfo.schoolId) {
        const tenantContext = await this.tenantService.getTenantContext(
          tenant.id,
          tenantInfo.schoolId,
        );
        request.school = tenantContext.school;
        request.tenantContext.school = tenantContext.school;
      }

      this.logger.log(`Tenant context set: ${tenant.name} (${tenant.databaseName})`);
      return true;
    } catch (error) {
      this.logger.error("Tenant guard error:", error);
      throw new UnauthorizedException("Invalid tenant context");
    }
  }

  private extractTenantInfo(request: RequestWithTenant): {
    subdomain?: string;
    domain?: string;
    schoolId?: string;
  } | null {
    const host = request.headers["host"] as string;
    const schoolId = request.headers["x-school-id"] as string;

    if (!host) {
      return null;
    }

    // Extract subdomain from host (e.g., tenant1.localhost:3000 -> tenant1)
    const subdomain = this.extractSubdomain(host);

    // For production, you might want to check against registered domains
    const domain = this.isCustomDomain(host) ? host : undefined;

    return {
      subdomain,
      domain,
      schoolId,
    };
  }

  private extractSubdomain(host: string): string | undefined {
    // Remove port if present
    const hostname = host.split(":")[0];

    // Split by dots and check if it's a subdomain
    const parts = hostname.split(".");

    // If we have more than 2 parts, the first part is likely the subdomain
    if (parts.length > 2) {
      return parts[0];
    }

    // For localhost development, check for patterns like tenant1.localhost
    if (hostname.includes("localhost") && parts.length === 2) {
      return parts[0];
    }

    return undefined;
  }

  private isCustomDomain(host: string): boolean {
    // Add logic to check if the host is a registered custom domain
    // For now, we'll assume any non-localhost domain is custom
    return !host.includes("localhost") && !host.includes("127.0.0.1");
  }
}
