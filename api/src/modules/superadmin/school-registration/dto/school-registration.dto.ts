import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import {
  SchoolRegistrationStatus,
  SchoolType,
} from "../../../../database/entities/school-registration.entity";

export class SchoolRegistrationDataDto {
  @ApiProperty({
    description: "Name of the school",
    example: "Greenfield Academy",
  })
  @IsString()
  schoolName: string;

  @ApiProperty({
    description: "Unique school code",
    example: "GFA001",
  })
  @IsString()
  schoolCode: string;

  @ApiProperty({
    description: "Type of school",
    enum: SchoolType,
    example: SchoolType.SECONDARY,
  })
  @IsEnum(SchoolType)
  schoolType: SchoolType;

  @ApiPropertyOptional({
    description: "Description of the school",
    example: "A leading educational institution focused on holistic development",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "School address",
    example: "123 Education Street",
  })
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: "City",
    example: "Lagos",
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: "State/Province",
    example: "Lagos State",
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: "Country",
    example: "Nigeria",
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: "Postal code",
    example: "100001",
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({
    description: "School phone number",
    example: "+234-123-456-7890",
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: "School email address",
    example: "info@greenfieldacademy.edu",
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: "School website",
    example: "https://www.greenfieldacademy.edu",
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    description: "Principal's full name",
    example: "Dr. Sarah Johnson",
  })
  @IsString()
  principalName: string;

  @ApiProperty({
    description: "Principal's email address",
    example: "principal@greenfieldacademy.edu",
  })
  @IsEmail()
  principalEmail: string;

  @ApiPropertyOptional({
    description: "Principal's phone number",
    example: "+234-123-456-7891",
  })
  @IsOptional()
  @IsString()
  principalPhone?: string;

  @ApiPropertyOptional({
    description: "Administrative contact name",
    example: "Mr. John Smith",
  })
  @IsOptional()
  @IsString()
  adminContactName?: string;

  @ApiPropertyOptional({
    description: "Administrative contact email",
    example: "admin@greenfieldacademy.edu",
  })
  @IsOptional()
  @IsEmail()
  adminContactEmail?: string;

  @ApiPropertyOptional({
    description: "Administrative contact phone",
    example: "+234-123-456-7892",
  })
  @IsOptional()
  @IsString()
  adminContactPhone?: string;

  @ApiPropertyOptional({
    description: "School documents",
    type: "object",
    additionalProperties: true,
    example: {
      registrationCertificate: "cert_123.pdf",
      taxExemptionCertificate: "tax_123.pdf",
      accreditationDocument: "accred_123.pdf",
      principalIdDocument: "principal_id_123.pdf",
      otherDocuments: ["doc1.pdf", "doc2.pdf"],
    },
  })
  @IsOptional()
  @IsObject()
  documents?: {
    registrationCertificate?: string;
    taxExemptionCertificate?: string;
    accreditationDocument?: string;
    principalIdDocument?: string;
    otherDocuments?: string[];
  };

  @ApiPropertyOptional({
    description: "School settings",
    type: "object",
    additionalProperties: true,
    example: {
      academicYear: "2024-2025",
      gradingSystem: "percentage",
      languageOfInstruction: "English",
      timezone: "Africa/Lagos",
      currency: "NGN",
      maxStudentsPerClass: 30,
      features: ["online_learning", "parent_portal", "student_portal"],
    },
  })
  @IsOptional()
  @IsObject()
  settings?: {
    academicYear?: string;
    gradingSystem?: string;
    languageOfInstruction?: string;
    timezone?: string;
    currency?: string;
    maxStudentsPerClass?: number;
    features?: string[];
  };

  @ApiPropertyOptional({
    description: "Additional metadata",
    type: "object",
    additionalProperties: true,
    example: { notes: "Special requirements", priority: "high" },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SchoolRegistrationFiltersDto {
  @ApiPropertyOptional({
    description: "Filter by registration status",
    enum: SchoolRegistrationStatus,
  })
  @IsOptional()
  @IsEnum(SchoolRegistrationStatus)
  status?: SchoolRegistrationStatus;

  @ApiPropertyOptional({
    description: "Filter by school type",
    enum: SchoolType,
  })
  @IsOptional()
  @IsEnum(SchoolType)
  schoolType?: SchoolType;

  @ApiPropertyOptional({
    description: "Filter by tenant ID",
    type: String,
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({
    description: "Search query",
    example: "Greenfield Academy",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by reviewer ID",
    type: String,
  })
  @IsOptional()
  @IsUUID()
  reviewedBy?: string;

  @ApiPropertyOptional({
    description: "Filter by approver ID",
    type: String,
  })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @ApiPropertyOptional({
    description: "Filter from date",
    type: Date,
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional({
    description: "Filter to date",
    type: Date,
  })
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class SchoolRegistrationResponseDto {
  @ApiProperty({
    description: "Registration ID",
    example: "reg-123",
  })
  id: string;

  @ApiProperty({
    description: "Tenant ID",
    example: "tenant-123",
  })
  tenantId: string;

  @ApiProperty({
    description: "School name",
    example: "Greenfield Academy",
  })
  schoolName: string;

  @ApiProperty({
    description: "School code",
    example: "GFA001",
  })
  schoolCode: string;

  @ApiProperty({
    description: "School type",
    enum: SchoolType,
    example: SchoolType.SECONDARY,
  })
  schoolType: SchoolType;

  @ApiProperty({
    description: "Registration status",
    enum: SchoolRegistrationStatus,
    example: SchoolRegistrationStatus.PENDING,
  })
  status: SchoolRegistrationStatus;

  @ApiProperty({
    description: "School email",
    example: "info@greenfieldacademy.edu",
  })
  email: string;

  @ApiProperty({
    description: "Principal name",
    example: "Dr. Sarah Johnson",
  })
  principalName: string;

  @ApiProperty({
    description: "Created at",
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: "Updated at",
    type: Date,
  })
  updatedAt: Date;
}

export class SchoolRegistrationStatsDto {
  @ApiProperty({
    description: "Total registrations",
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: "Pending registrations",
    example: 25,
  })
  pending: number;

  @ApiProperty({
    description: "Under review registrations",
    example: 15,
  })
  underReview: number;

  @ApiProperty({
    description: "Approved registrations",
    example: 45,
  })
  approved: number;

  @ApiProperty({
    description: "Rejected registrations",
    example: 10,
  })
  rejected: number;

  @ApiProperty({
    description: "Cancelled registrations",
    example: 5,
  })
  cancelled: number;
}

export class ApproveRegistrationDto {
  @ApiPropertyOptional({
    description: "Approval notes",
    example: "All requirements met, school approved for registration",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectRegistrationDto {
  @ApiProperty({
    description: "Reason for rejection",
    example: "Incomplete documentation provided",
  })
  @IsString()
  reason: string;
}

export class CancelRegistrationDto {
  @ApiPropertyOptional({
    description: "Reason for cancellation",
    example: "School requested cancellation",
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
