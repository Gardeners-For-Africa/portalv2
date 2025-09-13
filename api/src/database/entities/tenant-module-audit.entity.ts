import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Tenant } from "./tenant.entity";
import { TenantModule } from "./tenant-module.entity";
import { User } from "./user.entity";

export enum ModuleAuditAction {
  ENABLED = "enabled",
  DISABLED = "disabled",
  UPDATED = "updated",
  CONFIGURED = "configured",
}

@Entity("tenant_module_audit_logs")
@Index(["tenantId"])
@Index(["moduleId"])
@Index(["userId"])
@Index(["action"])
@Index(["createdAt"])
export class TenantModuleAudit {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  tenantId: string;

  @Column()
  moduleId: string;

  @Column({
    type: "enum",
    enum: ModuleAuditAction,
  })
  action: ModuleAuditAction;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: "jsonb", nullable: true })
  changes: Record<string, any>;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToOne(() => TenantModule, { onDelete: "CASCADE" })
  @JoinColumn({ name: "moduleId" })
  module: TenantModule;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
