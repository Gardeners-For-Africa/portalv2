import * as crypto from "node:crypto";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserStatus, UserType } from "../../database/entities/user.entity";
import { TenantService } from "../../tenant/tenant.service";
import { CookieService } from "../services/cookie.service";
import { JwtService } from "../services/jwt.service";
import { AuthenticatedUser } from "../types";
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  RequestMagicLinkDto,
  ResetPasswordDto,
  SSOCallbackDto,
  SSOProvider,
  VerifyMagicLinkDto,
} from "./dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private cookieService: CookieService,
    private tenantService: TenantService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["roles", "roles.permissions", "tenant", "school"],
    });

    if (user && (await user.validatePassword(password))) {
      return user;
    }

    return null;
  }

  async validateUserById(userId: string, tenantId?: string): Promise<User | null> {
    const whereCondition: any = { id: userId };
    if (tenantId) {
      whereCondition.tenantId = tenantId;
    }

    return this.userRepository.findOne({
      where: whereCondition,
      relations: ["roles", "roles.permissions", "tenant", "school"],
    });
  }

  async getUserWithPermissions(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ["roles", "roles.permissions"],
    });
  }

  async login(
    loginDto: LoginDto,
    tenantId: string,
    schoolId?: string,
  ): Promise<{ user: User; tokens: any }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, tenantId },
      relations: ["roles", "roles.permissions", "tenant", "school"],
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Account is not active");
    }

    // Check school access if specified
    if (schoolId && user.schoolId !== schoolId) {
      throw new UnauthorizedException("User does not belong to this school");
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair(
      {
        id: user.id,
        email: user.email,
        name: user.fullName,
      },
      tenantId,
      schoolId,
    );

    return { user, tokens };
  }

  async register(registerDto: RegisterDto, tenantId: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email, tenantId },
    });

    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // Verify tenant exists
    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    // Verify school exists if provided
    if (registerDto.schoolId) {
      const school = await this.tenantService.getSchoolById(registerDto.schoolId, tenantId);
      if (!school) {
        throw new NotFoundException("School not found");
      }
    }

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      tenantId,
      status: UserStatus.PENDING,
      emailVerificationToken: crypto.randomBytes(32).toString("hex"),
    });

    return this.userRepository.save(user);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto, tenantId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email, tenantId },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;

    await this.userRepository.save(user);

    // TODO: Send email with reset link
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, tenantId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: resetPasswordDto.token,
        tenantId,
      },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    user.password = resetPasswordDto.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await this.userRepository.save(user);
  }

  async requestMagicLink(
    requestMagicLinkDto: RequestMagicLinkDto,
    tenantId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: requestMagicLinkDto.email, tenantId },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate magic link token
    const magicToken = crypto.randomBytes(32).toString("hex");
    const magicExpires = new Date(Date.now() + 900000); // 15 minutes

    user.magicLinkToken = magicToken;
    user.magicLinkExpires = magicExpires;

    await this.userRepository.save(user);

    // TODO: Send email with magic link
    console.log(`Magic link token for ${user.email}: ${magicToken}`);
  }

  async verifyMagicLink(
    verifyMagicLinkDto: VerifyMagicLinkDto,
    tenantId: string,
  ): Promise<{ user: User; tokens: any }> {
    const user = await this.userRepository.findOne({
      where: {
        magicLinkToken: verifyMagicLinkDto.token,
        tenantId,
      },
      relations: ["roles", "roles.permissions", "tenant", "school"],
    });

    if (!user || !user.magicLinkExpires || user.magicLinkExpires < new Date()) {
      throw new BadRequestException("Invalid or expired magic link token");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Account is not active");
    }

    // Clear magic link token
    user.magicLinkToken = undefined;
    user.magicLinkExpires = undefined;
    user.lastLoginAt = new Date();

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair(
      {
        id: user.id,
        email: user.email,
        name: user.fullName,
      },
      tenantId,
      user.schoolId,
    );

    return { user, tokens };
  }

  // async ssoLogin(
  //   ssoData: any,
  //   tenantId: string,
  //   schoolId?: string,
  // ): Promise<{ user: User; tokens: any }> {
  //   let user = await this.userRepository.findOne({
  //     where: {
  //       ssoProvider: ssoData.ssoProvider,
  //       ssoId: ssoData.ssoId,
  //       tenantId,
  //     },
  //     relations: ["roles", "roles.permissions", "tenant", "school"],
  //   });

  //   if (!user) {
  //     // Check if user exists with same email
  //     user = await this.userRepository.findOne({
  //       where: { email: ssoData.email, tenantId },
  //       relations: ["roles", "roles.permissions", "tenant", "school"],
  //     });

  //     if (user) {
  //       // Link SSO account to existing user
  //       user.ssoProvider = ssoData.ssoProvider;
  //       user.ssoId = ssoData.ssoId;
  //       if (ssoData.avatar) user.avatar = ssoData.avatar;
  //     } else {
  //       // Create new user
  //       user = this.userRepository.create({
  //         firstName: ssoData.firstName,
  //         lastName: ssoData.lastName,
  //         email: ssoData.email,
  //         avatar: ssoData.avatar,
  //         ssoProvider: ssoData.ssoProvider,
  //         ssoId: ssoData.ssoId,
  //         tenantId,
  //         schoolId,
  //         userType: UserType.STUDENT, // Default type
  //         status: UserStatus.ACTIVE,
  //         emailVerifiedAt: new Date(),
  //       });

  //       user = await this.userRepository.save(user);
  //     }
  //   }

  //   if (user.status !== UserStatus.ACTIVE) {
  //     throw new UnauthorizedException("Account is not active");
  //   }

  //   // Check school access if specified
  //   if (schoolId && user.schoolId !== schoolId) {
  //     throw new UnauthorizedException("User does not belong to this school");
  //   }

  //   // Update last login
  //   user.lastLoginAt = new Date();
  //   await this.userRepository.save(user);

  //   // Generate tokens
  //   const tokens = this.jwtService.generateTokenPair(
  //     {
  //       id: user.id,
  //       email: user.email,
  //       name: user.fullName,
  //     },
  //     tenantId,
  //     schoolId,
  //   );

  //   return { user, tokens };
  // }

  async refreshToken(refreshToken: string, tenantId: string): Promise<any> {
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      const user = await this.validateUserById(payload.sub, tenantId);

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return this.jwtService.generateTokenPair(
        {
          id: user.id,
          email: user.email,
          name: user.fullName,
        },
        tenantId,
        user.schoolId,
      );
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string): Promise<void> {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store logout events
    // 3. Clear refresh tokens from database
    // For now, we'll just log the logout
    console.log(`User ${userId} logged out`);
  }
}
