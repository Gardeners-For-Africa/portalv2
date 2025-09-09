import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateSchoolRegistrationTable1700000000003 implements MigrationInterface {
  name = "CreateSchoolRegistrationTable1700000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "school_registration_status_enum" AS ENUM(
        'pending',
        'under_review',
        'approved',
        'rejected',
        'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "school_type_enum" AS ENUM(
        'primary',
        'secondary',
        'high_school',
        'college',
        'university',
        'vocational',
        'special_needs',
        'mixed'
      )
    `);

    // Create school_registrations table
    await queryRunner.createTable(
      new Table({
        name: "school_registrations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "tenantId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "schoolName",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "schoolCode",
            type: "varchar",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "schoolType",
            type: "enum",
            enum: [
              "primary",
              "secondary",
              "high_school",
              "college",
              "university",
              "vocational",
              "special_needs",
              "mixed",
            ],
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "address",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "city",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "state",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "country",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "postalCode",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "phone",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "website",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "principalName",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "principalEmail",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "principalPhone",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "adminContactName",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "adminContactEmail",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "adminContactPhone",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "under_review", "approved", "rejected", "cancelled"],
            default: "'pending'",
          },
          {
            name: "documents",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "settings",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "reviewedBy",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "reviewedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "reviewNotes",
            type: "text",
            isNullable: true,
          },
          {
            name: "rejectionReason",
            type: "text",
            isNullable: true,
          },
          {
            name: "approvedBy",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "approvedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "approvalNotes",
            type: "text",
            isNullable: true,
          },
          {
            name: "schoolId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      "school_registrations",
      new TableIndex({
        name: "IDX_school_registrations_tenantId",
        columnNames: ["tenantId"],
      }),
    );

    await queryRunner.createIndex(
      "school_registrations",
      new TableIndex({
        name: "IDX_school_registrations_status",
        columnNames: ["status"],
      }),
    );

    await queryRunner.createIndex(
      "school_registrations",
      new TableIndex({
        name: "IDX_school_registrations_schoolCode",
        columnNames: ["schoolCode"],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      "school_registrations",
      new TableIndex({
        name: "IDX_school_registrations_email",
        columnNames: ["email"],
        isUnique: true,
      }),
    );

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "school_registrations" 
      ADD CONSTRAINT "FK_school_registrations_tenantId" 
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "school_registrations" 
      ADD CONSTRAINT "FK_school_registrations_reviewedBy" 
      FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "school_registrations" 
      ADD CONSTRAINT "FK_school_registrations_approvedBy" 
      FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "school_registrations" 
      ADD CONSTRAINT "FK_school_registrations_schoolId" 
      FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "school_registrations" 
      DROP CONSTRAINT "FK_school_registrations_schoolId"
    `);

    await queryRunner.query(`
      ALTER TABLE "school_registrations" 
      DROP CONSTRAINT "FK_school_registrations_approvedBy"
    `);

    await queryRunner.query(`
      ALTER TABLE "school_registrations" 
      DROP CONSTRAINT "FK_school_registrations_reviewedBy"
    `);

    await queryRunner.query(`
      ALTER TABLE "school_registrations" 
      DROP CONSTRAINT "FK_school_registrations_tenantId"
    `);

    // Drop indexes
    await queryRunner.dropIndex("school_registrations", "IDX_school_registrations_email");
    await queryRunner.dropIndex("school_registrations", "IDX_school_registrations_schoolCode");
    await queryRunner.dropIndex("school_registrations", "IDX_school_registrations_status");
    await queryRunner.dropIndex("school_registrations", "IDX_school_registrations_tenantId");

    // Drop table
    await queryRunner.dropTable("school_registrations");

    // Drop enum types
    await queryRunner.query(`DROP TYPE "school_type_enum"`);
    await queryRunner.query(`DROP TYPE "school_registration_status_enum"`);
  }
}
