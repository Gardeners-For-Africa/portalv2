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
import { User } from "./user.entity";

export enum SchoolRegistrationStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum SchoolType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  HIGH_SCHOOL = "high_school",
  COLLEGE = "college",
  UNIVERSITY = "university",
  VOCATIONAL = "vocational",
  SPECIAL_NEEDS = "special_needs",
  MIXED = "mixed",
}

@Entity("school_registrations")
@Index(["tenantId"])
@Index(["status"])
@Index(["schoolCode"], { unique: true })
@Index(["email"], { unique: true })
export class SchoolRegistration {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  // School Information
  @Column()
  schoolName: string;

  @Column({ unique: true })
  schoolCode: string;

  @Column()
  schoolType: SchoolType;

  @Column({ nullable: true })
  description?: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column()
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  website?: string;

  // Administrative Information
  @Column()
  principalName: string;

  @Column()
  principalEmail: string;

  @Column({ nullable: true })
  principalPhone?: string;

  @Column({ nullable: true })
  adminContactName?: string;

  @Column({ nullable: true })
  adminContactEmail?: string;

  @Column({ nullable: true })
  adminContactPhone?: string;

  // Registration Details
  @Column({
    type: "enum",
    enum: SchoolRegistrationStatus,
    default: SchoolRegistrationStatus.PENDING,
  })
  status: SchoolRegistrationStatus;

  @Column({ type: "jsonb", nullable: true })
  documents: {
    registrationCertificate?: string;
    taxExemptionCertificate?: string;
    accreditationDocument?: string;
    principalIdDocument?: string;
    otherDocuments?: string[];
  };

  @Column({ type: "jsonb", nullable: true })
  settings: {
    academicYear?: string;
    gradingSystem?: string;
    languageOfInstruction?: string;
    timezone?: string;
    currency?: string;
    maxStudentsPerClass?: number;
    features?: string[];
  };

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  // Review Information
  @Column({ nullable: true })
  reviewedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "reviewedBy" })
  reviewer?: User;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @Column({ type: "text", nullable: true })
  reviewNotes?: string;

  @Column({ type: "text", nullable: true })
  rejectionReason?: string;

  // Approval Information
  @Column({ nullable: true })
  approvedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approvedBy" })
  approver?: User;

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ type: "text", nullable: true })
  approvalNotes?: string;

  // School ID after approval
  @Column({ nullable: true })
  schoolId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get isPending(): boolean {
    return this.status === SchoolRegistrationStatus.PENDING;
  }

  get isUnderReview(): boolean {
    return this.status === SchoolRegistrationStatus.UNDER_REVIEW;
  }

  get isApproved(): boolean {
    return this.status === SchoolRegistrationStatus.APPROVED;
  }

  get isRejected(): boolean {
    return this.status === SchoolRegistrationStatus.REJECTED;
  }

  get isCancelled(): boolean {
    return this.status === SchoolRegistrationStatus.CANCELLED;
  }

  get fullAddress(): string {
    const parts = [this.address];
    if (this.city) parts.push(this.city);
    if (this.state) parts.push(this.state);
    if (this.postalCode) parts.push(this.postalCode);
    if (this.country) parts.push(this.country);
    return parts.join(", ");
  }

  get canBeReviewed(): boolean {
    return this.status === SchoolRegistrationStatus.PENDING;
  }

  get canBeApproved(): boolean {
    return this.status === SchoolRegistrationStatus.UNDER_REVIEW;
  }

  get canBeRejected(): boolean {
    return [SchoolRegistrationStatus.PENDING, SchoolRegistrationStatus.UNDER_REVIEW].includes(
      this.status,
    );
  }

  get canBeCancelled(): boolean {
    return [SchoolRegistrationStatus.PENDING, SchoolRegistrationStatus.UNDER_REVIEW].includes(
      this.status,
    );
  }

  startReview(reviewedBy: string): void {
    if (!this.canBeReviewed) {
      throw new Error("School registration cannot be reviewed in current status");
    }
    this.status = SchoolRegistrationStatus.UNDER_REVIEW;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
  }

  approve(approvedBy: string, schoolId: string, notes?: string): void {
    if (!this.canBeApproved) {
      throw new Error("School registration cannot be approved in current status");
    }
    this.status = SchoolRegistrationStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.schoolId = schoolId;
    if (notes) {
      this.approvalNotes = notes;
    }
  }

  reject(reviewedBy: string, reason: string): void {
    if (!this.canBeRejected) {
      throw new Error("School registration cannot be rejected in current status");
    }
    this.status = SchoolRegistrationStatus.REJECTED;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.rejectionReason = reason;
  }

  cancel(reviewedBy: string, reason?: string): void {
    if (!this.canBeCancelled) {
      throw new Error("School registration cannot be cancelled in current status");
    }
    this.status = SchoolRegistrationStatus.CANCELLED;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    if (reason) {
      this.rejectionReason = reason;
    }
  }
}
