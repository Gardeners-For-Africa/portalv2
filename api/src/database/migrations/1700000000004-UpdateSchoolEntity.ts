import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchoolEntity1700000000004 implements MigrationInterface {
  name = "UpdateSchoolEntity1700000000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create SchoolType enum
    await queryRunner.query(`
      CREATE TYPE "school_type_enum" AS ENUM(
        'primary',
        'secondary', 
        'high_school',
        'college',
        'university',
        'vocational',
        'special_needs',
        'international',
        'private',
        'public',
        'charter',
        'montessori',
        'waldorf',
        'other'
      )
    `);

    // Add new columns to schools table
    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "type" "school_type_enum" NOT NULL DEFAULT 'other'
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "description" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "city" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "state" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "country" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "postalCode" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "principalName" character varying NOT NULL DEFAULT ''
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "principalEmail" character varying NOT NULL DEFAULT ''
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "principalPhone" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "adminContactName" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "adminContactEmail" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "adminContactPhone" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "documents" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ADD COLUMN "metadata" jsonb
    `);

    // Update existing schools with default values
    await queryRunner.query(`
      UPDATE "schools" 
      SET "principalName" = 'Principal', 
          "principalEmail" = "email"
      WHERE "principalName" = ''
    `);

    // Remove default values after data migration
    await queryRunner.query(`
      ALTER TABLE "schools" 
      ALTER COLUMN "principalName" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ALTER COLUMN "principalEmail" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "schools" 
      ALTER COLUMN "type" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove new columns
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "metadata"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "documents"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "adminContactPhone"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "adminContactEmail"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "adminContactName"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "principalPhone"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "principalEmail"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "principalName"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "postalCode"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "state"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN "type"`);

    // Drop SchoolType enum
    await queryRunner.query(`DROP TYPE "school_type_enum"`);
  }
}
