import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTenantTables1700000000000 implements MigrationInterface {
  name = "CreateTenantTables1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenants table
    await queryRunner.createTable(
      new Table({
        name: "tenants",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "subdomain",
            type: "varchar",
            length: "100",
            isUnique: true,
          },
          {
            name: "domain",
            type: "varchar",
            length: "255",
            isUnique: true,
            isNullable: true,
          },
          {
            name: "databaseName",
            type: "varchar",
            length: "100",
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "settings",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "description",
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

    // Create indexes for tenants table
    await queryRunner.query(`CREATE INDEX "IDX_tenants_subdomain" ON "tenants" ("subdomain")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenants_domain" ON "tenants" ("domain")`);

    // Create schools table
    await queryRunner.createTable(
      new Table({
        name: "schools",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
          },
          {
            name: "code",
            type: "varchar",
            length: "50",
            isUnique: true,
          },
          {
            name: "address",
            type: "text",
            isNullable: true,
          },
          {
            name: "phone",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "website",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "settings",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "tenantId",
            type: "uuid",
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
        foreignKeys: [
          {
            columnNames: ["tenantId"],
            referencedTableName: "tenants",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );

    // Create indexes for schools table
    await queryRunner.query(`CREATE INDEX "IDX_schools_tenantId" ON "schools" ("tenantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_schools_code" ON "schools" ("code")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("schools");
    await queryRunner.dropTable("tenants");
  }
}
