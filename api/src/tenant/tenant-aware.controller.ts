import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { SchoolId, TenantContext, TenantId } from "../shared/decorators/tenant.decorator";
import type {
  RequestWithTenant,
  TenantContext as TenantContextType,
} from "../shared/interfaces/tenant-context.interface";
import { TenantGuard } from "./tenant.guard";

@Controller("tenant-aware")
@UseGuards(TenantGuard)
export class TenantAwareController {
  @Get("info")
  getTenantInfo(@TenantContext() tenantContext: TenantContextType) {
    return {
      message: "This is a tenant-aware endpoint",
      tenant: {
        id: tenantContext.tenant.id,
        name: tenantContext.tenant.name,
        subdomain: tenantContext.tenant.subdomain,
        databaseName: tenantContext.tenant.databaseName,
      },
      school: tenantContext.school
        ? {
            id: tenantContext.school.id,
            name: tenantContext.school.name,
            code: tenantContext.school.code,
          }
        : null,
    };
  }

  @Get("tenant-id")
  getTenantId(@TenantId() tenantId: string) {
    return { tenantId };
  }

  @Get("school-id")
  getSchoolId(@SchoolId() schoolId: string) {
    return { schoolId };
  }

  @Get("raw-request")
  getRawRequest(@Req() request: RequestWithTenant) {
    return {
      tenant: request.tenant,
      school: request.school,
      tenantContext: request.tenantContext,
    };
  }
}
