import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { School } from "../../../database/entities/school.entity";
import {
  SchoolRegistration,
  SchoolRegistrationStatus,
  SchoolType,
} from "../../../database/entities/school-registration.entity";
import { Tenant } from "../../../database/entities/tenant.entity";
import { User } from "../../../database/entities/user.entity";

export interface SchoolRegistrationData {
  schoolName: string;
  schoolCode: string;
  schoolType: SchoolType;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone: string;
  email: string;
  website?: string;
  principalName: string;
  principalEmail: string;
  principalPhone?: string;
  adminContactName?: string;
  adminContactEmail?: string;
  adminContactPhone?: string;
  documents?: {
    registrationCertificate?: string;
    taxExemptionCertificate?: string;
    accreditationDocument?: string;
    principalIdDocument?: string;
    otherDocuments?: string[];
  };
  settings?: {
    academicYear?: string;
    gradingSystem?: string;
    languageOfInstruction?: string;
    timezone?: string;
    currency?: string;
    maxStudentsPerClass?: number;
    features?: string[];
  };
  metadata?: Record<string, any>;
}

export interface SchoolRegistrationFilters {
  status?: SchoolRegistrationStatus;
  schoolType?: SchoolType;
  tenantId?: string;
  search?: string;
  reviewedBy?: string;
  approvedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SchoolRegistrationResult {
  registrations: SchoolRegistration[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class SchoolRegistrationService {
  constructor(
    @InjectRepository(SchoolRegistration)
    private readonly registrationRepository: Repository<SchoolRegistration>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Create a new school registration
   */
  async createRegistration(
    tenantId: string,
    data: SchoolRegistrationData,
  ): Promise<SchoolRegistration> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    // Check if school code already exists
    const existingByCode = await this.registrationRepository.findOne({
      where: { schoolCode: data.schoolCode },
    });
    if (existingByCode) {
      throw new ConflictException("School code already exists");
    }

    // Check if email already exists
    const existingByEmail = await this.registrationRepository.findOne({
      where: { email: data.email },
    });
    if (existingByEmail) {
      throw new ConflictException("School email already exists");
    }

    const registration = this.registrationRepository.create({
      tenantId,
      ...data,
      status: SchoolRegistrationStatus.PENDING,
    });

    return await this.registrationRepository.save(registration);
  }

  /**
   * Get all school registrations with filters and pagination
   */
  async getRegistrations(
    filters: SchoolRegistrationFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<SchoolRegistrationResult> {
    const queryBuilder = this.registrationRepository
      .createQueryBuilder("registration")
      .leftJoinAndSelect("registration.tenant", "tenant")
      .leftJoinAndSelect("registration.reviewer", "reviewer")
      .leftJoinAndSelect("registration.approver", "approver");

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere("registration.status = :status", { status: filters.status });
    }

    if (filters.schoolType) {
      queryBuilder.andWhere("registration.schoolType = :schoolType", {
        schoolType: filters.schoolType,
      });
    }

    if (filters.tenantId) {
      queryBuilder.andWhere("registration.tenantId = :tenantId", { tenantId: filters.tenantId });
    }

    if (filters.reviewedBy) {
      queryBuilder.andWhere("registration.reviewedBy = :reviewedBy", {
        reviewedBy: filters.reviewedBy,
      });
    }

    if (filters.approvedBy) {
      queryBuilder.andWhere("registration.approvedBy = :approvedBy", {
        approvedBy: filters.approvedBy,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere("registration.createdAt >= :dateFrom", { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere("registration.createdAt <= :dateTo", { dateTo: filters.dateTo });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(registration.schoolName ILIKE :search OR registration.schoolCode ILIKE :search OR registration.email ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    const registrations = await queryBuilder
      .orderBy("registration.createdAt", "DESC")
      .skip(offset)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      registrations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get a school registration by ID
   */
  async getRegistrationById(id: string): Promise<SchoolRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ["tenant", "reviewer", "approver"],
    });

    if (!registration) {
      throw new NotFoundException("School registration not found");
    }

    return registration;
  }

  /**
   * Start review process
   */
  async startReview(id: string, reviewedBy: string): Promise<SchoolRegistration> {
    const registration = await this.getRegistrationById(id);

    if (!registration.canBeReviewed) {
      throw new BadRequestException("School registration cannot be reviewed in current status");
    }

    registration.startReview(reviewedBy);
    return await this.registrationRepository.save(registration);
  }

  /**
   * Approve school registration
   */
  async approveRegistration(
    id: string,
    approvedBy: string,
    schoolId: string,
    notes?: string,
  ): Promise<SchoolRegistration> {
    const registration = await this.getRegistrationById(id);

    if (!registration.canBeApproved) {
      throw new BadRequestException("School registration cannot be approved in current status");
    }

    // Verify school exists
    const school = await this.schoolRepository.findOne({ where: { id: schoolId } });
    if (!school) {
      throw new NotFoundException("School not found");
    }

    registration.approve(approvedBy, schoolId, notes);
    return await this.registrationRepository.save(registration);
  }

  /**
   * Reject school registration
   */
  async rejectRegistration(
    id: string,
    reviewedBy: string,
    reason: string,
  ): Promise<SchoolRegistration> {
    const registration = await this.getRegistrationById(id);

    if (!registration.canBeRejected) {
      throw new BadRequestException("School registration cannot be rejected in current status");
    }

    registration.reject(reviewedBy, reason);
    return await this.registrationRepository.save(registration);
  }

  /**
   * Cancel school registration
   */
  async cancelRegistration(
    id: string,
    reviewedBy: string,
    reason?: string,
  ): Promise<SchoolRegistration> {
    const registration = await this.getRegistrationById(id);

    if (!registration.canBeCancelled) {
      throw new BadRequestException("School registration cannot be cancelled in current status");
    }

    registration.cancel(reviewedBy, reason);
    return await this.registrationRepository.save(registration);
  }

  /**
   * Update school registration
   */
  async updateRegistration(
    id: string,
    data: Partial<SchoolRegistrationData>,
  ): Promise<SchoolRegistration> {
    const registration = await this.getRegistrationById(id);

    if (registration.status !== SchoolRegistrationStatus.PENDING) {
      throw new BadRequestException("Only pending registrations can be updated");
    }

    // Check for conflicts if updating unique fields
    if (data.schoolCode && data.schoolCode !== registration.schoolCode) {
      const existing = await this.registrationRepository.findOne({
        where: { schoolCode: data.schoolCode },
      });
      if (existing) {
        throw new ConflictException("School code already exists");
      }
    }

    if (data.email && data.email !== registration.email) {
      const existing = await this.registrationRepository.findOne({
        where: { email: data.email },
      });
      if (existing) {
        throw new ConflictException("School email already exists");
      }
    }

    Object.assign(registration, data);
    return await this.registrationRepository.save(registration);
  }

  /**
   * Delete school registration
   */
  async deleteRegistration(id: string): Promise<void> {
    const registration = await this.getRegistrationById(id);

    if (registration.status === SchoolRegistrationStatus.APPROVED) {
      throw new BadRequestException("Approved registrations cannot be deleted");
    }

    await this.registrationRepository.remove(registration);
  }

  /**
   * Get registration statistics
   */
  async getRegistrationStats(): Promise<{
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    cancelled: number;
  }> {
    const [total, pending, underReview, approved, rejected, cancelled] = await Promise.all([
      this.registrationRepository.count(),
      this.registrationRepository.count({ where: { status: SchoolRegistrationStatus.PENDING } }),
      this.registrationRepository.count({
        where: { status: SchoolRegistrationStatus.UNDER_REVIEW },
      }),
      this.registrationRepository.count({ where: { status: SchoolRegistrationStatus.APPROVED } }),
      this.registrationRepository.count({ where: { status: SchoolRegistrationStatus.REJECTED } }),
      this.registrationRepository.count({ where: { status: SchoolRegistrationStatus.CANCELLED } }),
    ]);

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
      cancelled,
    };
  }

  /**
   * Get registrations by status
   */
  async getRegistrationsByStatus(status: SchoolRegistrationStatus): Promise<SchoolRegistration[]> {
    return await this.registrationRepository.find({
      where: { status },
      relations: ["tenant", "reviewer", "approver"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Search registrations
   */
  async searchRegistrations(
    query: string,
    filters: Omit<SchoolRegistrationFilters, "search"> = {},
  ): Promise<SchoolRegistration[]> {
    const queryBuilder = this.registrationRepository
      .createQueryBuilder("registration")
      .leftJoinAndSelect("registration.tenant", "tenant")
      .leftJoinAndSelect("registration.reviewer", "reviewer")
      .leftJoinAndSelect("registration.approver", "approver")
      .where(
        "(registration.schoolName ILIKE :query OR registration.schoolCode ILIKE :query OR registration.email ILIKE :query OR registration.principalName ILIKE :query)",
        { query: `%${query}%` },
      );

    // Apply additional filters
    if (filters.status) {
      queryBuilder.andWhere("registration.status = :status", { status: filters.status });
    }

    if (filters.schoolType) {
      queryBuilder.andWhere("registration.schoolType = :schoolType", {
        schoolType: filters.schoolType,
      });
    }

    if (filters.tenantId) {
      queryBuilder.andWhere("registration.tenantId = :tenantId", { tenantId: filters.tenantId });
    }

    return await queryBuilder.orderBy("registration.createdAt", "DESC").getMany();
  }
}
