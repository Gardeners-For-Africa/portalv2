import { ForeignKey, Index, MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTeacherInvitationsTable1700000000005 implements MigrationInterface {
  name = "CreateTeacherInvitationsTable1700000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE "invitation_status" AS ENUM(
        'pending',
        'accepted',
        'declined',
        'expired',
        'cancelled'
      )
    `);

    // Create table
    await queryRunner.createTable(
      new Table({
        name: "teacher_invitations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "token",
            type: "varchar",
            length: "500",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "accepted", "declined", "expired", "cancelled"],
            default: "'pending'",
          },
          {
            name: "firstName",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "lastName",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "message",
            type: "text",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "expiresAt",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "acceptedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "declinedAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "cancelledAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "acceptedBy",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "declinedBy",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "cancelledBy",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "schoolId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "invitedBy",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "acceptedByUserId",
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
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_teacher_invitations_token" ON "teacher_invitations" ("token")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_teacher_invitations_email_school" ON "teacher_invitations" ("email", "schoolId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_teacher_invitations_status" ON "teacher_invitations" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_teacher_invitations_expires_at" ON "teacher_invitations" ("expiresAt")`,
    );

    // Create foreign keys
    await queryRunner.query(
      `ALTER TABLE "teacher_invitations" ADD CONSTRAINT "FK_teacher_invitations_schoolId" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_invitations" ADD CONSTRAINT "FK_teacher_invitations_invitedBy" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_invitations" ADD CONSTRAINT "FK_teacher_invitations_acceptedByUserId" FOREIGN KEY ("acceptedByUserId") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable("teacher_invitations");
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey("teacher_invitations", foreignKey);
      }
    }

    // Drop indexes
    await queryRunner.dropIndex("teacher_invitations", "IDX_teacher_invitations_token");
    await queryRunner.dropIndex("teacher_invitations", "IDX_teacher_invitations_email_school");
    await queryRunner.dropIndex("teacher_invitations", "IDX_teacher_invitations_status");
    await queryRunner.dropIndex("teacher_invitations", "IDX_teacher_invitations_expires_at");

    // Drop table
    await queryRunner.dropTable("teacher_invitations");

    // Drop enum type
    await queryRunner.query(`DROP TYPE "invitation_status"`);
  }
}
