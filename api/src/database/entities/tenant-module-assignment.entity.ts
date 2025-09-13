import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tenant } from "./tenant.entity";
import { TenantModule } from "./tenant-module.entity";
import { User } from "./user.entity";

@Entity("tenant_module_assignments")
@Index(["tenantId", "moduleId"], { unique: true })
@Index(["tenantId"])
@Index(["moduleId"])
export class TenantModuleAssignment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  tenantId: string;

  @Column()
  moduleId: string;

  @Column({ default: false })
  isEnabled: boolean = false;

  @Column({ type: "timestamp", nullable: true })
  enabledAt: Date;

  @Column({ nullable: true })
  enabledBy: string;

  @Column({ type: "timestamp", nullable: true })
  disabledAt: Date;

  @Column({ nullable: true })
  disabledBy: string;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "text", nullable: true })
  reason: string;

  @Column({ type: "jsonb", nullable: true })
  configuration: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToOne(() => TenantModule, { onDelete: "CASCADE" })
  @JoinColumn({ name: "moduleId" })
  module: TenantModule;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "enabledBy" })
  enabledByUser: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "disabledBy" })
  disabledByUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
