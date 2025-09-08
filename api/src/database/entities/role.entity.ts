import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Permission } from "./permission.entity";
import { Tenant } from "./tenant.entity";
import { User } from "./user.entity";

@Entity("roles")
@Index(["name", "tenantId"], { unique: true })
@Index(["tenantId"])
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Column()
  tenantId: string;

  @ManyToOne(
    () => Tenant,
    (tenant) => tenant.roles,
  )
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToMany(
    () => User,
    (user) => user.roles,
  )
  users: User[];

  @ManyToMany(
    () => Permission,
    (permission) => permission.roles,
  )
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "roleId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permissionId", referencedColumnName: "id" },
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
