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
import { SchoolType } from "./school-registration.entity";
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

  @Column({ type: "enum", enum: SchoolType })
  type: SchoolType;

  @Column({ nullable: true })
  description: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  principalName: string;

  @Column()
  principalEmail: string;

  @Column({ nullable: true })
  principalPhone: string;

  @Column({ nullable: true })
  adminContactName: string;

  @Column({ nullable: true })
  adminContactEmail: string;

  @Column({ nullable: true })
  adminContactPhone: string;

  @Column({ type: "jsonb", nullable: true })
  documents: {
    registrationCertificate?: string;
    taxExemptionCertificate?: string;
    accreditationDocument?: string;
    principalIdDocument?: string;
    otherDocuments?: string[];
  };

  @Column({ type: "jsonb", nullable: true })
  settings: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

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
