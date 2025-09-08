import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthenticatedUser } from "../../types";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          // Extract JWT from cookies
          if (req && req.cookies) {
            return req.cookies.accessToken;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("jwt.jwtSecret"),
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    const { sub: userId, tenantId, schoolId } = payload;

    if (!userId) {
      throw new UnauthorizedException("Invalid token payload");
    }

    // Get user from database with tenant and role information
    const user = await this.authService.validateUserById(userId, tenantId);

    if (!user) {
      throw new UnauthorizedException("User not found or inactive");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("User account is inactive");
    }

    // Check if user belongs to the correct tenant
    if (tenantId && user.tenantId !== tenantId) {
      throw new UnauthorizedException("User does not belong to this tenant");
    }

    // Check if user belongs to the correct school (if specified)
    if (schoolId && user.schoolId !== schoolId) {
      throw new UnauthorizedException("User does not belong to this school");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.userType,
      tenantId: user.tenantId,
      schoolId: user.schoolId,
      sub: user.id,
    };
  }
}
