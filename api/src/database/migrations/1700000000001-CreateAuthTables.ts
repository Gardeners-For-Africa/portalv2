import { ForeignKey, Index, MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAuthTables1700000000001 implements MigrationInterface {
  name = "CreateAuthTables1700000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying,
        "phone" character varying,
        "avatar" character varying,
        "status" character varying NOT NULL DEFAULT 'pending',
        "userType" character varying NOT NULL,
        "lastLoginAt" TIMESTAMP,
        "emailVerifiedAt" TIMESTAMP,
        "phoneVerifiedAt" TIMESTAMP,
        "metadata" jsonb,
        "resetPasswordToken" character varying,
        "resetPasswordExpires" TIMESTAMP,
        "emailVerificationToken" character varying,
        "magicLinkToken" character varying,
        "magicLinkExpires" TIMESTAMP,
        "ssoProvider" character varying,
        "ssoId" character varying,
        "tenantId" uuid NOT NULL,
        "schoolId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "tenantId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
      )
    `);

    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "resource" character varying,
        "action" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id")
      )
    `);

    // Create user_roles junction table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "userId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId")
      )
    `);

    // Create role_permissions junction table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId")
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email_tenant" ON "users" ("email", "tenantId")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_users_tenantId" ON "users" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_schoolId" ON "users" ("schoolId")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_roles_name_tenant" ON "roles" ("name", "tenantId")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_roles_tenantId" ON "roles" ("tenantId")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_permissions_name" ON "permissions" ("name")`);

    // Create foreign keys
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_tenantId" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_schoolId" 
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "roles" 
      ADD CONSTRAINT "FK_roles_tenantId" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "user_roles" 
      ADD CONSTRAINT "FK_user_roles_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "user_roles" 
      ADD CONSTRAINT "FK_user_roles_roleId" 
      FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" 
      ADD CONSTRAINT "FK_role_permissions_roleId" 
      FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" 
      ADD CONSTRAINT "FK_role_permissions_permissionId" 
      FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permissionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_roleId"`,
    );
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_roleId"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_userId"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_roles_tenantId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_schoolId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_tenantId"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_permissions_name"`);
    await queryRunner.query(`DROP INDEX "IDX_roles_tenantId"`);
    await queryRunner.query(`DROP INDEX "IDX_roles_name_tenant"`);
    await queryRunner.query(`DROP INDEX "IDX_users_schoolId"`);
    await queryRunner.query(`DROP INDEX "IDX_users_tenantId"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email_tenant"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
