import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "./role.entity";
import { School } from "./school.entity";
import { User } from "./user.entity";

@Entity("tenants")
@Index(["subdomain"], { unique: true })
@Index(["domain"], { unique: true })
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  subdomain: string;

  @Column({ unique: true, nullable: true })
  domain: string;

  @Column()
  databaseName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "jsonb", nullable: true })
  settings: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  modules: Array<{
    moduleId: string;
    moduleCode: string;
    moduleName: string;
    isEnabled: boolean;
    enabledAt?: string;
    enabledBy?: string;
    notes?: string;
  }>;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => School,
    (school) => school.tenant,
  )
  schools: School[];

  @OneToMany(
    () => User,
    (user) => user.tenant,
  )
  users: User[];

  @OneToMany(
    () => Role,
    (role) => role.tenantId,
  )
  roles: Role[];
}
