import * as bcrypt from "bcryptjs";
import { Exclude } from "class-transformer";
import {
  BeforeInsert,
  BeforeUpdate,
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
import { Role } from "./role.entity";
import { School } from "./school.entity";
import { Tenant } from "./tenant.entity";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

export enum UserType {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

@Entity("users")
@Index(["email", "tenantId"], { unique: true })
@Index(["tenantId"])
@Index(["schoolId"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({
    type: "enum",
    enum: UserType,
  })
  userType: UserType;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  magicLinkToken?: string;

  @Column({ nullable: true })
  magicLinkExpires?: Date;

  @Column({ nullable: true })
  ssoProvider?: string;

  @Column({ nullable: true })
  ssoId?: string;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  schoolId?: string;

  @ManyToOne(
    () => Tenant,
    (tenant) => tenant.users,
  )
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToOne(
    () => School,
    (school) => school.users,
  )
  @JoinColumn({ name: "schoolId" })
  school?: School;

  @ManyToMany(
    () => Role,
    (role) => role.users,
  )
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "roleId", referencedColumnName: "id" },
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  get isPhoneVerified(): boolean {
    return !!this.phoneVerifiedAt;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  hasRole(roleName: string): boolean {
    return this.roles?.some((role) => role.name === roleName) || false;
  }

  hasPermission(permissionName: string): boolean {
    return (
      this.roles?.some((role) =>
        role.permissions?.some((permission) => permission.name === permissionName),
      ) || false
    );
  }
}
