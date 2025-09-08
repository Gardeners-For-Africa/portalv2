import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
  path?: string;
  domain?: string;
}

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService) {}

  setCookie(res: Response, name: string, value: string, options: CookieOptions = {}): void {
    const {
      httpOnly = true,
      secure = this.configService.get<string>("NODE_ENV") === "production",
      sameSite = "lax",
      maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days default
      path = "/",
      domain = this.configService.get<string>("app.cookieDomain"),
    } = options;

    res.cookie(name, value, {
      httpOnly,
      secure,
      sameSite,
      maxAge,
      path,
      domain,
    });
  }

  clearCookie(res: Response, name: string, options: Partial<CookieOptions> = {}): void {
    const { path = "/", domain = this.configService.get<string>("app.cookieDomain") } = options;

    res.clearCookie(name, {
      httpOnly: true,
      secure: this.configService.get<string>("NODE_ENV") === "production",
      sameSite: "lax",
      path,
      domain,
    });
  }

  setAccessTokenCookie(res: Response, token: string): void {
    this.setCookie(res, "accessToken", token, {
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }

  setRefreshTokenCookie(res: Response, token: string): void {
    this.setCookie(res, "refreshToken", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearAuthCookies(res: Response): void {
    this.clearCookie(res, "accessToken");
    this.clearCookie(res, "refreshToken");
  }
}
