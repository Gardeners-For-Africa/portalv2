import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUserOnboardingTable1700000000002 implements MigrationInterface {
  name = "CreateUserOnboardingTable1700000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "onboarding_status_enum" AS ENUM(
        'not_started',
        'in_progress', 
        'completed',
        'abandoned',
        'requires_approval'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "onboarding_step_enum" AS ENUM(
        'account_creation',
        'email_verification',
        'profile_setup',
        'school_selection',
        'school_registration',
        'school_verification',
        'role_selection',
        'permissions_setup',
        'dashboard_tour',
        'completion'
      )
    `);

    // Create user_onboarding table
    await queryRunner.createTable(
      new Table({
        name: "user_onboarding",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["not_started", "in_progress", "completed", "abandoned", "requires_approval"],
            default: "'not_started'",
          },
          {
            name: "currentStep",
            type: "enum",
            enum: [
              "account_creation",
              "email_verification",
              "profile_setup",
              "school_selection",
              "school_registration",
              "school_verification",
              "role_selection",
              "permissions_setup",
              "dashboard_tour",
              "completion",
            ],
            default: "'account_creation'",
          },
          {
            name: "completedSteps",
            type: "jsonb",
            default: "'[]'",
          },
          {
            name: "stepData",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "startedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "completedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "lastStepAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "abandonedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "approvedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "approvedBy",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "notes",
            type: "text",
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
      "user_onboarding",
      new TableIndex({
        name: "IDX_user_onboarding_userId",
        columnNames: ["userId"],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      "user_onboarding",
      new TableIndex({
        name: "IDX_user_onboarding_status",
        columnNames: ["status"],
      }),
    );

    await queryRunner.createIndex(
      "user_onboarding",
      new TableIndex({
        name: "IDX_user_onboarding_currentStep",
        columnNames: ["currentStep"],
      }),
    );

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "user_onboarding" 
      ADD CONSTRAINT "FK_user_onboarding_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Add foreign key constraint for approvedBy
    await queryRunner.query(`
      ALTER TABLE "user_onboarding" 
      ADD CONSTRAINT "FK_user_onboarding_approvedBy" 
      FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "user_onboarding" 
      DROP CONSTRAINT "FK_user_onboarding_approvedBy"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_onboarding" 
      DROP CONSTRAINT "FK_user_onboarding_userId"
    `);

    // Drop indexes
    await queryRunner.dropIndex("user_onboarding", "IDX_user_onboarding_currentStep");
    await queryRunner.dropIndex("user_onboarding", "IDX_user_onboarding_status");
    await queryRunner.dropIndex("user_onboarding", "IDX_user_onboarding_userId");

    // Drop table
    await queryRunner.dropTable("user_onboarding");

    // Drop enum types
    await queryRunner.query(`DROP TYPE "onboarding_step_enum"`);
    await queryRunner.query(`DROP TYPE "onboarding_status_enum"`);
  }
}
