import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tenant } from "./tenant.entity";
import { User } from "./user.entity";

@Entity("schools")
@Index(["tenantId"])
@Index(["code"], { unique: true })
export class School {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: "jsonb", nullable: true })
  settings: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  tenantId: string;

  @ManyToOne(
    () => Tenant,
    (tenant) => tenant.schools,
  )
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @OneToMany(
    () => User,
    (user) => user.school,
  )
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
