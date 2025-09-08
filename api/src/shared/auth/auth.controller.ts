import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { TenantContext } from "../decorators/tenant.decorator";
import { CookieService } from "../services/cookie.service";
import type { AuthenticatedUser } from "../types";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";
import {
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  RegisterDto,
  RegisterResponseDto,
  RequestMagicLinkDto,
  RequestMagicLinkResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  SSOCallbackDto,
  SSOLoginDto,
  SSOLoginResponseDto,
  VerifyMagicLinkDto,
  VerifyMagicLinkResponseDto,
} from "./dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { TenantGuard } from "./guards/tenant.guard";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User login" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @TenantContext() tenantContext: any,
  ): Promise<LoginResponseDto> {
    const { user, tokens } = await this.authService.login(
      loginDto,
      tenantContext.tenant.id,
      tenantContext.school?.id,
    );

    // Set cookies
    this.cookieService.setAccessTokenCookie(res, tokens.accessToken);
    this.cookieService.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        tenantId: user.tenantId,
        schoolId: user.schoolId,
      },
      expiresAt: new Date(tokens.accessTokenExpires).toISOString(),
    };
  }

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "User registration" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "Registration successful",
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "User already exists" })
  async register(
    @Body() registerDto: RegisterDto,
    @TenantContext() tenantContext: any,
  ): Promise<RegisterResponseDto> {
    const user = await this.authService.register(registerDto, tenantContext.tenant.id);

    return {
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        status: user.status,
      },
    };
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password reset email sent",
    type: ForgotPasswordResponseDto,
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @TenantContext() tenantContext: any,
  ): Promise<ForgotPasswordResponseDto> {
    await this.authService.forgotPassword(forgotPasswordDto, tenantContext.tenant.id);

    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password reset successful",
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @TenantContext() tenantContext: any,
  ): Promise<ResetPasswordResponseDto> {
    await this.authService.resetPassword(resetPasswordDto, tenantContext.tenant.id);

    return {
      success: true,
      message: "Password reset successful",
    };
  }

  @Public()
  @Post("magic-link/request")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request magic link login" })
  @ApiBody({ type: RequestMagicLinkDto })
  @ApiResponse({
    status: 200,
    description: "Magic link sent",
    type: RequestMagicLinkResponseDto,
  })
  async requestMagicLink(
    @Body() requestMagicLinkDto: RequestMagicLinkDto,
    @TenantContext() tenantContext: any,
  ): Promise<RequestMagicLinkResponseDto> {
    await this.authService.requestMagicLink(requestMagicLinkDto, tenantContext.tenant.id);

    return {
      success: true,
      message: "Magic link sent to your email",
    };
  }

  @Public()
  @Post("magic-link/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify magic link and login" })
  @ApiBody({ type: VerifyMagicLinkDto })
  @ApiResponse({
    status: 200,
    description: "Magic link verified successfully",
    type: VerifyMagicLinkResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  async verifyMagicLink(
    @Body() verifyMagicLinkDto: VerifyMagicLinkDto,
    @Res({ passthrough: true }) res: Response,
    @TenantContext() tenantContext: any,
  ): Promise<VerifyMagicLinkResponseDto> {
    const { user, tokens } = await this.authService.verifyMagicLink(
      verifyMagicLinkDto,
      tenantContext.tenant.id,
    );

    // Set cookies
    this.cookieService.setAccessTokenCookie(res, tokens.accessToken);
    this.cookieService.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      success: true,
      message: "Magic link verified successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        tenantId: user.tenantId,
        schoolId: user.schoolId,
      },
      expiresAt: new Date(tokens.accessTokenExpires).toISOString(),
    };
  }

  @Public()
  @Get("sso/:provider")
  @ApiOperation({ summary: "Initiate SSO login" })
  @ApiParam({
    name: "provider",
    description: "SSO provider",
    enum: ["google", "facebook", "github", "twitter"],
  })
  @ApiQuery({ name: "redirectUrl", required: false, description: "Redirect URL after login" })
  @ApiResponse({ status: 302, description: "Redirect to SSO provider" })
  async ssoLogin(@Param("provider") provider: string, @Query("redirectUrl") redirectUrl?: string) {
    // This would typically redirect to the SSO provider
    // Implementation depends on the specific SSO provider
    return { message: `Redirect to ${provider} SSO` };
  }

  @Public()
  @Get("sso/:provider/callback")
  @ApiOperation({ summary: "SSO callback handler" })
  @ApiParam({ name: "provider", description: "SSO provider" })
  @ApiQuery({ name: "code", description: "Authorization code" })
  @ApiQuery({ name: "state", description: "State parameter" })
  @ApiResponse({
    status: 200,
    description: "SSO login successful",
    type: SSOLoginResponseDto,
  })
  async ssoCallback(
    @Param("provider") provider: string,
    @Query() query: any,
    @Res({ passthrough: true }) res: Response,
    @TenantContext() tenantContext: any,
  ): Promise<SSOLoginResponseDto> {
    const ssoData = {
      ssoProvider: provider,
      ssoId: query.code, // This would be properly extracted from the SSO response
      email: "user@example.com", // This would come from the SSO provider
      firstName: "User",
      lastName: "Name",
    };

    const { user, tokens } = await this.authService.ssoLogin(
      ssoData,
      tenantContext.tenant.id,
      tenantContext.school?.id,
    );

    // Set cookies
    this.cookieService.setAccessTokenCookie(res, tokens.accessToken);
    this.cookieService.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      success: true,
      message: "SSO login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        tenantId: user.tenantId,
        schoolId: user.schoolId,
        ssoProvider: user.ssoProvider || "",
      },
      expiresAt: new Date(tokens.accessTokenExpires).toISOString(),
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: "Token refreshed successfully",
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @TenantContext() tenantContext: any,
  ): Promise<RefreshTokenResponseDto> {
    const tokens = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      tenantContext.tenant.id,
    );

    // Set new access token cookie
    this.cookieService.setAccessTokenCookie(res, tokens.accessToken);

    return {
      success: true,
      message: "Token refreshed successfully",
      expiresAt: new Date(tokens.accessTokenExpires).toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "User logout" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Logout successful",
    type: LogoutResponseDto,
  })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    await this.authService.logout(user.id);

    // Clear cookies
    this.cookieService.clearAuthCookies(res);

    return {
      success: true,
      message: "Logout successful",
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "User profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        schoolId: user.schoolId,
      },
    };
  }
}
