import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import { InvitationStatus } from "../entities/teacher-invitation.entity";

export class CreateTeacherInvitationDto {
  @ApiProperty({ description: "Teacher's email address", example: "teacher@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: "Teacher's first name", example: "John" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: "Teacher's last name", example: "Doe" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: "Personal message to the teacher",
    example: "Welcome to our school!",
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  message?: string;

  @ApiPropertyOptional({
    description: "Additional metadata",
    example: { department: "Mathematics", grade: "10" },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateTeacherInvitationDto {
  @ApiPropertyOptional({ description: "Teacher's first name", example: "John" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: "Teacher's last name", example: "Doe" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: "Personal message to the teacher",
    example: "Welcome to our school!",
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  message?: string;

  @ApiPropertyOptional({
    description: "Additional metadata",
    example: { department: "Mathematics", grade: "10" },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: "Notes about the invitation", example: "Follow up required" })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ description: "Teacher's first name", example: "John" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: "Teacher's last name", example: "Doe" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ description: "Password for the new account", example: "SecurePassword123!" })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({ description: "Phone number", example: "+1234567890" })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: "Additional user metadata",
    example: { department: "Mathematics" },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class DeclineInvitationDto {
  @ApiPropertyOptional({
    description: "Reason for declining",
    example: "Not interested in this position",
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

export class ResendInvitationDto {
  @ApiPropertyOptional({
    description: "Personal message to the teacher",
    example: "Reminder: Please accept your invitation",
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  message?: string;
}

export class TeacherInvitationResponseDto {
  @ApiProperty({ description: "Invitation ID" })
  id: string;

  @ApiProperty({ description: "Teacher's email address" })
  email: string;

  @ApiProperty({ description: "Invitation token" })
  token: string;

  @ApiProperty({ description: "Invitation status", enum: InvitationStatus })
  status: InvitationStatus;

  @ApiPropertyOptional({ description: "Teacher's first name" })
  firstName?: string;

  @ApiPropertyOptional({ description: "Teacher's last name" })
  lastName?: string;

  @ApiPropertyOptional({ description: "Personal message" })
  message?: string;

  @ApiPropertyOptional({ description: "Additional metadata" })
  metadata?: Record<string, any>;

  @ApiProperty({ description: "Expiration date" })
  expiresAt: Date;

  @ApiPropertyOptional({ description: "Acceptance date" })
  acceptedAt?: Date;

  @ApiPropertyOptional({ description: "Decline date" })
  declinedAt?: Date;

  @ApiPropertyOptional({ description: "Cancellation date" })
  cancelledAt?: Date;

  @ApiProperty({ description: "School ID" })
  schoolId: string;

  @ApiProperty({ description: "Inviter user ID" })
  invitedBy: string;

  @ApiPropertyOptional({ description: "Accepted by user ID" })
  acceptedByUserId?: string;

  @ApiProperty({ description: "Creation date" })
  createdAt: Date;

  @ApiProperty({ description: "Last update date" })
  updatedAt: Date;

  @ApiPropertyOptional({ description: "School information" })
  school?: {
    id: string;
    name: string;
    type: string;
  };

  @ApiPropertyOptional({ description: "Inviter information" })
  inviter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiPropertyOptional({ description: "Accepted by user information" })
  acceptedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class InvitationStatsDto {
  @ApiProperty({ description: "Total invitations" })
  total: number;

  @ApiProperty({ description: "Pending invitations" })
  pending: number;

  @ApiProperty({ description: "Accepted invitations" })
  accepted: number;

  @ApiProperty({ description: "Declined invitations" })
  declined: number;

  @ApiProperty({ description: "Expired invitations" })
  expired: number;

  @ApiProperty({ description: "Cancelled invitations" })
  cancelled: number;

  @ApiProperty({ description: "Invitations expiring in 7 days" })
  expiringSoon: number;
}

export class InvitationListResponseDto {
  @ApiProperty({ description: "List of invitations", type: [TeacherInvitationResponseDto] })
  invitations: TeacherInvitationResponseDto[];

  @ApiProperty({ description: "Total count" })
  total: number;

  @ApiProperty({ description: "Current page" })
  page: number;

  @ApiProperty({ description: "Items per page" })
  limit: number;

  @ApiProperty({ description: "Total pages" })
  totalPages: number;
}
