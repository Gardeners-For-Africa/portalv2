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
import { School } from "../../../../database/entities/school.entity";
import { User } from "../../../../database/entities/user.entity";

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

@Entity("teacher_invitations")
@Index(["token"], { unique: true })
@Index(["email", "schoolId"], { unique: true })
@Index(["status"])
@Index(["expiresAt"])
export class TeacherInvitation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 500 })
  token: string;

  @Column({
    type: "enum",
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  firstName?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  lastName?: string;

  @Column({ type: "text", nullable: true })
  message?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "timestamp", nullable: true })
  acceptedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  declinedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  cancelledAt?: Date;

  @Column({ type: "varchar", length: 500, nullable: true })
  acceptedBy?: string; // IP address or user agent

  @Column({ type: "varchar", length: 500, nullable: true })
  declinedBy?: string; // IP address or user agent

  @Column({ type: "varchar", length: 500, nullable: true })
  cancelledBy?: string; // IP address or user agent

  @Column({ type: "text", nullable: true })
  notes?: string;

  // Relations
  @Column({ type: "uuid" })
  schoolId: string;

  @ManyToOne(() => School, { onDelete: "CASCADE" })
  @JoinColumn({ name: "schoolId" })
  school: School;

  @Column({ type: "uuid" })
  invitedBy: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invitedBy" })
  inviter: User;

  @Column({ type: "uuid", nullable: true })
  acceptedByUserId?: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "acceptedByUserId" })
  acceptedByUser?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  canBeAccepted(): boolean {
    return this.status === InvitationStatus.PENDING && !this.isExpired();
  }

  canBeDeclined(): boolean {
    return this.status === InvitationStatus.PENDING && !this.isExpired();
  }

  canBeCancelled(): boolean {
    return this.status === InvitationStatus.PENDING;
  }

  accept(acceptedBy?: string): void {
    if (!this.canBeAccepted()) {
      throw new Error("Invitation cannot be accepted");
    }
    this.status = InvitationStatus.ACCEPTED;
    this.acceptedAt = new Date();
    this.acceptedBy = acceptedBy;
  }

  decline(declinedBy?: string): void {
    if (!this.canBeDeclined()) {
      throw new Error("Invitation cannot be declined");
    }
    this.status = InvitationStatus.DECLINED;
    this.declinedAt = new Date();
    this.declinedBy = declinedBy;
  }

  cancel(cancelledBy?: string): void {
    if (!this.canBeCancelled()) {
      throw new Error("Invitation cannot be cancelled");
    }
    this.status = InvitationStatus.CANCELLED;
    this.cancelledAt = new Date();
    this.cancelledBy = cancelledBy;
  }

  expire(): void {
    if (this.status === InvitationStatus.PENDING) {
      this.status = InvitationStatus.EXPIRED;
    }
  }

  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.email;
  }

  getInvitationUrl(baseUrl: string): string {
    return `${baseUrl}/invite/teacher?token=${this.token}`;
  }

  getDaysUntilExpiry(): number {
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
