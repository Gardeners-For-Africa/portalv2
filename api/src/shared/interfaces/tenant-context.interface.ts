import { School } from "../../database/entities/school.entity";
import { Tenant } from "../../database/entities/tenant.entity";

export interface TenantContext {
  tenant: Tenant;
  school?: School;
  databaseName: string;
}

export interface RequestWithTenant extends Request {
  tenant: Tenant;
  school?: School;
  tenantContext: TenantContext;
}
