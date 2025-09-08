import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { TenantService } from "../../../tenant/tenant.service";
import { AuthenticatedUser } from "../../types";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Get tenant context from request
    const tenantContext = request.tenantContext;

    if (!tenantContext) {
      throw new ForbiddenException("Tenant context not found");
    }

    // Verify user belongs to the tenant
    if (user.tenantId !== tenantContext.tenant.id) {
      throw new ForbiddenException("User does not belong to this tenant");
    }

    // If school context is required, verify user belongs to the school
    if (tenantContext.school && user.schoolId !== tenantContext.school.id) {
      throw new ForbiddenException("User does not belong to this school");
    }

    return true;
  }
}
