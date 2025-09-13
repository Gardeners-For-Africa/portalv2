import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum ModuleCategory {
  ACADEMIC = "academic",
  FINANCIAL = "financial",
  ADMINISTRATIVE = "administrative",
  COMMUNICATION = "communication",
  REPORTING = "reporting",
  SYSTEM = "system",
  STUDENT_LIFE = "student_life",
  HUMAN_RESOURCES = "human_resources",
}

@Entity("tenant_modules")
@Index(["code"], { unique: true })
export class TenantModule {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column()
  icon: string;

  @Column({
    type: "enum",
    enum: ModuleCategory,
    default: ModuleCategory.ADMINISTRATIVE,
  })
  category: ModuleCategory = ModuleCategory.ADMINISTRATIVE;

  @Column({ default: true })
  isSystemModule: boolean = true;

  @Column({ default: true })
  isActive: boolean = true;

  @Column({ default: 0 })
  order: number = 0;

  @Column({ type: "jsonb", default: "[]" })
  permissions: string[] = [];

  @Column({ type: "jsonb", nullable: true })
  dependencies: string[] = [];

  @Column({ type: "jsonb", nullable: true })
  exclusions: string[] = [];

  @Column({ type: "text", nullable: true })
  configurationSchema: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
