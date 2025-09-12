import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Repository } from "typeorm";
import { School } from "../../../database/entities/school.entity";
import { User, UserType } from "../../../database/entities/user.entity";
import { AuthService } from "../../../shared/auth/auth.service";
import { MailService } from "../../../shared/services/mail/mail.service";
import {
  AcceptInvitationDto,
  CreateTeacherInvitationDto,
  DeclineInvitationDto,
  InvitationListResponseDto,
  InvitationStatsDto,
  ResendInvitationDto,
  TeacherInvitationResponseDto,
  UpdateTeacherInvitationDto,
} from "./dto/teacher-invitation.dto";
import { InvitationStatus, TeacherInvitation } from "./entities/teacher-invitation.entity";

@Injectable()
export class TeacherInvitationService {
  constructor(
    @InjectRepository(TeacherInvitation)
    private invitationRepository: Repository<TeacherInvitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    private mailService: MailService,
    private authService: AuthService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createInvitation(
    createDto: CreateTeacherInvitationDto,
    schoolId: string,
    invitedBy: string,
    tenantId: string,
  ): Promise<TeacherInvitationResponseDto> {
    // Check if school exists and belongs to tenant
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId, tenantId },
    });

    if (!school) {
      throw new NotFoundException("School not found");
    }

    // Check if user already exists with this email
    const existingUser = await this.userRepository.findOne({
      where: { email: createDto.email, tenantId },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Check if there's already a pending invitation for this email and school
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        email: createDto.email,
        schoolId,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException("Pending invitation already exists for this email");
    }

    // Generate unique token
    const token = this.generateInvitationToken();

    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = this.invitationRepository.create({
      ...createDto,
      token,
      expiresAt,
      schoolId,
      invitedBy,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Load relations for response
    const invitationWithRelations = await this.invitationRepository.findOne({
      where: { id: savedInvitation.id },
      relations: ["school", "inviter", "acceptedByUser"],
    });

    // Send invitation email
    await this.sendInvitationEmail(invitationWithRelations as TeacherInvitation);

    // Emit event
    this.eventEmitter.emit("teacher.invitation.created", {
      invitation: invitationWithRelations,
      tenantId,
    });

    return this.mapToResponseDto(invitationWithRelations as TeacherInvitation);
  }

  async getInvitations(
    schoolId: string,
    tenantId: string,
    filters?: {
      status?: InvitationStatus;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<InvitationListResponseDto> {
    const query = this.invitationRepository
      .createQueryBuilder("invitation")
      .leftJoinAndSelect("invitation.school", "school")
      .leftJoinAndSelect("invitation.inviter", "inviter")
      .leftJoinAndSelect("invitation.acceptedByUser", "acceptedByUser")
      .where("invitation.schoolId = :schoolId", { schoolId })
      .andWhere("school.tenantId = :tenantId", { tenantId });

    if (filters?.status) {
      query.andWhere("invitation.status = :status", { status: filters.status });
    }

    if (filters?.search) {
      query.andWhere(
        "(invitation.email ILIKE :search OR invitation.firstName ILIKE :search OR invitation.lastName ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [invitations, total] = await query
      .orderBy("invitation.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      invitations: invitations.map(this.mapToResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInvitationById(
    id: string,
    schoolId: string,
    tenantId: string,
  ): Promise<TeacherInvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({
      where: { id, schoolId },
      relations: ["school", "inviter", "acceptedByUser"],
    });

    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    // Verify school belongs to tenant
    if (invitation.school.tenantId !== tenantId) {
      throw new NotFoundException("Invitation not found");
    }

    return this.mapToResponseDto(invitation);
  }

  async getInvitationByToken(token: string): Promise<TeacherInvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ["school", "inviter", "acceptedByUser"],
    });

    if (!invitation) {
      throw new NotFoundException("Invalid invitation token");
    }

    return this.mapToResponseDto(invitation);
  }

  async updateInvitation(
    id: string,
    updateDto: UpdateTeacherInvitationDto,
    schoolId: string,
    tenantId: string,
  ): Promise<TeacherInvitationResponseDto> {
    const invitation = await this.getInvitationById(id, schoolId, tenantId);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException("Only pending invitations can be updated");
    }

    Object.assign(invitation, updateDto);
    const updatedInvitation = await this.invitationRepository.save(invitation as TeacherInvitation);

    this.eventEmitter.emit("teacher.invitation.updated", {
      invitation: updatedInvitation,
      tenantId,
    });

    return this.mapToResponseDto(updatedInvitation);
  }

  async resendInvitation(
    id: string,
    resendDto: ResendInvitationDto,
    schoolId: string,
    tenantId: string,
  ): Promise<TeacherInvitationResponseDto> {
    const invitation = await this.getInvitationById(id, schoolId, tenantId);

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException("Only pending invitations can be resent");
    }

    if ((invitation as TeacherInvitation).isExpired()) {
      throw new BadRequestException("Cannot resend expired invitation");
    }

    // Update message if provided
    if (resendDto.message) {
      invitation.message = resendDto.message;
      await this.invitationRepository.save(invitation as TeacherInvitation);
    }

    // Send email again
    await this.sendInvitationEmail(invitation as TeacherInvitation);

    this.eventEmitter.emit("teacher.invitation.resent", {
      invitation,
      tenantId,
    });

    return this.mapToResponseDto(invitation as TeacherInvitation);
  }

  async cancelInvitation(
    id: string,
    schoolId: string,
    tenantId: string,
    cancelledBy?: string,
  ): Promise<TeacherInvitationResponseDto> {
    const invitation = await this.getInvitationById(id, schoolId, tenantId);

    if (!(invitation as TeacherInvitation).canBeCancelled()) {
      throw new BadRequestException("Invitation cannot be cancelled");
    }

    (invitation as TeacherInvitation).cancel(cancelledBy);
    const cancelledInvitation = await this.invitationRepository.save(
      invitation as TeacherInvitation,
    );

    this.eventEmitter.emit("teacher.invitation.cancelled", {
      invitation: cancelledInvitation,
      tenantId,
    });

    return this.mapToResponseDto(cancelledInvitation);
  }

  async acceptInvitation(
    token: string,
    acceptDto: AcceptInvitationDto,
    clientInfo?: string,
  ): Promise<{ user: User; invitation: TeacherInvitationResponseDto }> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ["school", "inviter"],
    });

    if (!invitation) {
      throw new NotFoundException("Invalid invitation token");
    }

    if (!invitation.canBeAccepted()) {
      throw new BadRequestException("Invitation cannot be accepted");
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: invitation.email, tenantId: invitation.school.tenantId },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Create user account
    const user = await this.authService.register(
      {
        email: invitation.email,
        password: acceptDto.password,
        firstName: acceptDto.firstName,
        lastName: acceptDto.lastName,
        phone: acceptDto.phone,
        schoolId: invitation.schoolId,
        userType: UserType.TEACHER,
      },
      invitation.school.tenantId,
    );

    // Update invitation
    invitation.accept(clientInfo);
    invitation.acceptedByUserId = user.id;
    await this.invitationRepository.save(invitation);

    // Emit event
    this.eventEmitter.emit("teacher.invitation.accepted", {
      invitation,
      user,
      tenantId: invitation.school.tenantId,
    });

    return {
      user,
      invitation: this.mapToResponseDto(invitation),
    };
  }

  async declineInvitation(
    token: string,
    declineDto: DeclineInvitationDto,
    clientInfo?: string,
  ): Promise<TeacherInvitationResponseDto> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ["school"],
    });

    if (!invitation) {
      throw new NotFoundException("Invalid invitation token");
    }

    if (!invitation.canBeDeclined()) {
      throw new BadRequestException("Invitation cannot be declined");
    }

    invitation.decline(clientInfo);
    if (declineDto.reason) {
      invitation.notes = declineDto.reason;
    }
    const declinedInvitation = await this.invitationRepository.save(invitation);

    this.eventEmitter.emit("teacher.invitation.declined", {
      invitation: declinedInvitation,
      tenantId: invitation.school.tenantId,
    });

    return this.mapToResponseDto(declinedInvitation);
  }

  async getInvitationStats(schoolId: string, tenantId: string): Promise<InvitationStatsDto> {
    const stats = await this.invitationRepository
      .createQueryBuilder("invitation")
      .leftJoin("invitation.school", "school")
      .where("invitation.schoolId = :schoolId", { schoolId })
      .andWhere("school.tenantId = :tenantId", { tenantId })
      .select("invitation.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("invitation.status")
      .getRawMany();

    const statsMap = stats.reduce(
      (acc, stat) => {
        acc[stat.status] = parseInt(stat.count, 10);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get invitations expiring soon (within 7 days)
    const expiringSoon = await this.invitationRepository.count({
      where: {
        schoolId,
        status: InvitationStatus.PENDING,
        expiresAt: Between(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      },
    });

    return {
      total: Object.values(statsMap).reduce(
        (sum: number, count: number) => sum + count,
        0,
      ) as number,
      pending: statsMap[InvitationStatus.PENDING] || 0,
      accepted: statsMap[InvitationStatus.ACCEPTED] || 0,
      declined: statsMap[InvitationStatus.DECLINED] || 0,
      expired: statsMap[InvitationStatus.EXPIRED] || 0,
      cancelled: statsMap[InvitationStatus.CANCELLED] || 0,
      expiringSoon,
    };
  }

  async cleanupExpiredInvitations(): Promise<number> {
    const expiredInvitations = await this.invitationRepository.find({
      where: {
        status: InvitationStatus.PENDING,
        expiresAt: Between(new Date(0), new Date()),
      },
    });

    for (const invitation of expiredInvitations) {
      invitation.expire();
    }

    if (expiredInvitations.length > 0) {
      await this.invitationRepository.save(expiredInvitations);
    }

    return expiredInvitations.length;
  }

  private generateInvitationToken(): string {
    return randomBytes(32).toString("hex");
  }

  private async sendInvitationEmail(invitation: TeacherInvitation): Promise<void> {
    const invitationUrl = invitation.getInvitationUrl(
      process.env.FRONTEND_URL || "http://localhost:3000",
    );
    const schoolName = invitation.school.name;
    const inviterName = invitation.inviter.fullName;

    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil(
      (invitation.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    await this.mailService.sendTeacherInvitation(invitation.email, {
      firstName: invitation.firstName || "Teacher",
      email: invitation.email,
      supportUrl: process.env.SUPPORT_URL || "https://support.example.com",
      helpUrl: process.env.HELP_URL || "https://help.example.com",
      contactUrl: process.env.CONTACT_URL || "https://contact.example.com",
      schoolName,
      inviterName,
      invitationUrl,
      message: invitation.message,
      expiresAt: invitation.expiresAt,
      daysUntilExpiry,
    });
  }

  private mapToResponseDto(invitation: TeacherInvitation): TeacherInvitationResponseDto {
    return {
      id: invitation.id,
      email: invitation.email,
      token: invitation.token,
      status: invitation.status,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      message: invitation.message,
      metadata: invitation.metadata,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      declinedAt: invitation.declinedAt,
      cancelledAt: invitation.cancelledAt,
      schoolId: invitation.schoolId,
      invitedBy: invitation.invitedBy,
      acceptedByUserId: invitation.acceptedByUserId,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
      school: invitation.school
        ? {
            id: invitation.school.id,
            name: invitation.school.name,
            type: invitation.school.type,
          }
        : undefined,
      inviter: invitation.inviter
        ? {
            id: invitation.inviter.id,
            firstName: invitation.inviter.firstName,
            lastName: invitation.inviter.lastName,
            email: invitation.inviter.email,
          }
        : undefined,
      acceptedByUser: invitation.acceptedByUser
        ? {
            id: invitation.acceptedByUser.id,
            firstName: invitation.acceptedByUser.firstName,
            lastName: invitation.acceptedByUser.lastName,
            email: invitation.acceptedByUser.email,
          }
        : undefined,
    };
  }
}
