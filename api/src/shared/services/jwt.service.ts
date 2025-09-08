import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService as NestJwtService } from "@nestjs/jwt";
import type { AuthenticatedUser } from "../types";

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  createAccessToken(payload: AuthenticatedUser): string {
    return this.nestJwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>("jwt.jwtSecret"),
      expiresIn: this.configService.getOrThrow<string>("jwt.jwtExpiresIn"),
    });
  }

  createRefreshToken(payload: { sub: string; email: string }): string {
    return this.nestJwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>("jwt.jwtRefreshSecret"),
      expiresIn: this.configService.getOrThrow<string>("jwt.jwtRefreshExpiresIn"),
    });
  }

  verifyAccessToken(token: string): AuthenticatedUser {
    return this.nestJwtService.verify(token, {
      secret: this.configService.getOrThrow<string>("jwt.jwtSecret"),
    });
  }

  verifyRefreshToken(token: string): { sub: string; email: string } {
    return this.nestJwtService.verify(token, {
      secret: this.configService.getOrThrow<string>("jwt.jwtRefreshSecret"),
    });
  }

  generateTokenPair(user: { id: string; email: string; name: string }): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken({
      sub: user.id,
      email: user.email,
    });

    // Calculate expiration time in seconds
    const expiresIn = this.getTokenExpirationTime();

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private getTokenExpirationTime(): number {
    const expiresIn = this.configService.getOrThrow<string>("jwt.jwtExpiresIn");

    // Parse the expiration time (e.g., "15m", "1h", "7d")
    const match = expiresIn?.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 15 * 60; // Default to 15 minutes
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      default:
        return 15 * 60;
    }
  }
}
