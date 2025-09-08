import { Tenant } from "../../database/entities/tenant.entity";

/**
 * Base event interface
 */
export interface BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
}

/**
 * Tenant Created Event
 * Published when a new tenant is created in the master database
 */
export class TenantCreatedEvent implements BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
  tenant: Tenant;

  constructor(tenant: Tenant) {
    this.eventId = `tenant_created_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.tenantId = tenant.id;
    this.tenantName = tenant.name;
    this.tenant = tenant;
  }
}

/**
 * Tenant Database Created Event
 * Published when a tenant database is successfully created
 */
export class TenantDatabaseCreatedEvent implements BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
  databaseName: string;

  constructor(tenant: Tenant) {
    this.eventId = `tenant_db_created_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.tenantId = tenant.id;
    this.tenantName = tenant.name;
    this.databaseName = tenant.databaseName;
  }
}

/**
 * Tenant Migrations Completed Event
 * Published when migrations are successfully run for a tenant
 */
export class TenantMigrationsCompletedEvent implements BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
  databaseName: string;
  migrationsCount: number;

  constructor(tenant: Tenant, migrationsCount: number = 0) {
    this.eventId = `tenant_migrations_completed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.tenantId = tenant.id;
    this.tenantName = tenant.name;
    this.databaseName = tenant.databaseName;
    this.migrationsCount = migrationsCount;
  }
}

/**
 * Tenant Seeders Completed Event
 * Published when seeders are successfully run for a tenant
 */
export class TenantSeedersCompletedEvent implements BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
  databaseName: string;
  seedersCount: number;

  constructor(tenant: Tenant, seedersCount: number = 0) {
    this.eventId = `tenant_seeders_completed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.tenantId = tenant.id;
    this.tenantName = tenant.name;
    this.databaseName = tenant.databaseName;
    this.seedersCount = seedersCount;
  }
}

/**
 * Tenant Setup Completed Event
 * Published when the entire tenant setup process is completed
 */
export class TenantSetupCompletedEvent implements BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
  databaseName: string;
  setupDuration: number; // in milliseconds

  constructor(tenant: Tenant, setupDuration: number) {
    this.eventId = `tenant_setup_completed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.tenantId = tenant.id;
    this.tenantName = tenant.name;
    this.databaseName = tenant.databaseName;
    this.setupDuration = setupDuration;
  }
}

/**
 * Tenant Deleted Event
 * Published when a tenant is soft deleted
 */
export class TenantDeletedEvent implements BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
  databaseName: string;

  constructor(tenant: Tenant) {
    this.eventId = `tenant_deleted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.tenantId = tenant.id;
    this.tenantName = tenant.name;
    this.databaseName = tenant.databaseName;
  }
}

/**
 * Tenant Permanently Deleted Event
 * Published when a tenant and its database are permanently deleted
 */
export class TenantPermanentlyDeletedEvent implements BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
  databaseName: string;

  constructor(tenant: Tenant) {
    this.eventId = `tenant_permanently_deleted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.tenantId = tenant.id;
    this.tenantName = tenant.name;
    this.databaseName = tenant.databaseName;
  }
}

/**
 * Tenant Setup Failed Event
 * Published when tenant setup fails at any stage
 */
export class TenantSetupFailedEvent implements BaseEvent {
  eventId: string;
  timestamp: Date;
  tenantId: string;
  tenantName: string;
  databaseName: string;
  error: string;
  stage: "database_creation" | "migrations" | "seeding";

  constructor(
    tenant: Tenant,
    error: string,
    stage: "database_creation" | "migrations" | "seeding",
  ) {
    this.eventId = `tenant_setup_failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.tenantId = tenant.id;
    this.tenantName = tenant.name;
    this.databaseName = tenant.databaseName;
    this.error = error;
    this.stage = stage;
  }
}
