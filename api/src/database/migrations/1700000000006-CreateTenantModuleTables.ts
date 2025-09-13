import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantModuleTables1700000000006 implements MigrationInterface {
  name = "CreateTenantModuleTables1700000000006";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenant_modules table
    await queryRunner.query(`
      CREATE TYPE "public"."tenant_modules_category_enum" AS ENUM(
        'academic', 
        'financial', 
        'administrative', 
        'communication', 
        'reporting', 
        'system', 
        'student_life', 
        'human_resources'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_modules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text NOT NULL,
        "icon" character varying NOT NULL,
        "category" "public"."tenant_modules_category_enum" NOT NULL DEFAULT 'administrative',
        "isSystemModule" boolean NOT NULL DEFAULT true,
        "isActive" boolean NOT NULL DEFAULT true,
        "order" integer NOT NULL DEFAULT '0',
        "permissions" jsonb NOT NULL DEFAULT '[]',
        "dependencies" jsonb,
        "exclusions" jsonb,
        "configurationSchema" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_modules_code" UNIQUE ("code"),
        CONSTRAINT "PK_tenant_modules" PRIMARY KEY ("id")
      )
    `);

    // Create tenant_module_assignments table
    await queryRunner.query(`
      CREATE TYPE "public"."tenant_module_audit_action_enum" AS ENUM(
        'enabled', 
        'disabled', 
        'updated', 
        'configured'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenant_module_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "moduleId" uuid NOT NULL,
        "isEnabled" boolean NOT NULL DEFAULT false,
        "enabledAt" TIMESTAMP,
        "enabledBy" uuid,
        "disabledAt" TIMESTAMP,
        "disabledBy" uuid,
        "notes" text,
        "reason" text,
        "configuration" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_module_assignments_tenant_module" UNIQUE ("tenantId", "moduleId"),
        CONSTRAINT "PK_tenant_module_assignments" PRIMARY KEY ("id")
      )
    `);

    // Create tenant_module_audit_logs table
    await queryRunner.query(`
      CREATE TABLE "tenant_module_audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "moduleId" uuid NOT NULL,
        "action" "public"."tenant_module_audit_action_enum" NOT NULL,
        "userId" uuid,
        "changes" jsonb,
        "notes" text,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_module_audit_logs" PRIMARY KEY ("id")
      )
    `);

    // Add modules column to tenants table
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      ADD COLUMN "modules" jsonb
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_modules_code" ON "tenant_modules" ("code")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_module_assignments_tenant" ON "tenant_module_assignments" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_module_assignments_module" ON "tenant_module_assignments" ("moduleId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_module_assignments_tenant_module" ON "tenant_module_assignments" ("tenantId", "moduleId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_module_audit_logs_tenant" ON "tenant_module_audit_logs" ("tenantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_module_audit_logs_module" ON "tenant_module_audit_logs" ("moduleId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_module_audit_logs_user" ON "tenant_module_audit_logs" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_module_audit_logs_action" ON "tenant_module_audit_logs" ("action")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_module_audit_logs_created_at" ON "tenant_module_audit_logs" ("createdAt")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "tenant_module_assignments" 
      ADD CONSTRAINT "FK_tenant_module_assignments_tenant" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_assignments" 
      ADD CONSTRAINT "FK_tenant_module_assignments_module" 
      FOREIGN KEY ("moduleId") REFERENCES "tenant_modules"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_assignments" 
      ADD CONSTRAINT "FK_tenant_module_assignments_enabled_by" 
      FOREIGN KEY ("enabledBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_assignments" 
      ADD CONSTRAINT "FK_tenant_module_assignments_disabled_by" 
      FOREIGN KEY ("disabledBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_audit_logs" 
      ADD CONSTRAINT "FK_tenant_module_audit_logs_tenant" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_audit_logs" 
      ADD CONSTRAINT "FK_tenant_module_audit_logs_module" 
      FOREIGN KEY ("moduleId") REFERENCES "tenant_modules"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_audit_logs" 
      ADD CONSTRAINT "FK_tenant_module_audit_logs_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "tenant_module_audit_logs" 
      DROP CONSTRAINT "FK_tenant_module_audit_logs_user"
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_audit_logs" 
      DROP CONSTRAINT "FK_tenant_module_audit_logs_module"
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_audit_logs" 
      DROP CONSTRAINT "FK_tenant_module_audit_logs_tenant"
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_assignments" 
      DROP CONSTRAINT "FK_tenant_module_assignments_disabled_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_assignments" 
      DROP CONSTRAINT "FK_tenant_module_assignments_enabled_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_assignments" 
      DROP CONSTRAINT "FK_tenant_module_assignments_module"
    `);

    await queryRunner.query(`
      ALTER TABLE "tenant_module_assignments" 
      DROP CONSTRAINT "FK_tenant_module_assignments_tenant"
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_tenant_module_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_tenant_module_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX "IDX_tenant_module_audit_logs_user"`);
    await queryRunner.query(`DROP INDEX "IDX_tenant_module_audit_logs_module"`);
    await queryRunner.query(`DROP INDEX "IDX_tenant_module_audit_logs_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_tenant_module_assignments_tenant_module"`);
    await queryRunner.query(`DROP INDEX "IDX_tenant_module_assignments_module"`);
    await queryRunner.query(`DROP INDEX "IDX_tenant_module_assignments_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_tenant_modules_code"`);

    // Remove modules column from tenants table
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      DROP COLUMN "modules"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "tenant_module_audit_logs"`);
    await queryRunner.query(`DROP TABLE "tenant_module_assignments"`);
    await queryRunner.query(`DROP TABLE "tenant_modules"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."tenant_module_audit_action_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tenant_modules_category_enum"`);
  }
}
