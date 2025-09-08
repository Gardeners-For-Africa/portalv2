import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

export enum SSOProvider {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  GITHUB = "github",
  TWITTER = "twitter",
}

export class SSOLoginDto {
  @ApiProperty({
    description: "SSO provider",
    enum: SSOProvider,
    example: SSOProvider.GOOGLE,
  })
  @IsEnum(SSOProvider, { message: "Please provide a valid SSO provider" })
  provider: SSOProvider;

  @ApiProperty({
    description: "Redirect URL after login",
    example: "https://app.example.com/dashboard",
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

export class SSOCallbackDto {
  @ApiProperty({
    description: "Authorization code from SSO provider",
    example: "auth-code-123",
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: "State parameter for security",
    example: "state-123",
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: "SSO provider",
    enum: SSOProvider,
    example: SSOProvider.GOOGLE,
  })
  @IsEnum(SSOProvider, { message: "Please provide a valid SSO provider" })
  provider: SSOProvider;
}

export class SSOLoginResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "SSO login successful",
  })
  message: string;

  @ApiProperty({
    description: "User information",
    type: "object",
    additionalProperties: true,
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    tenantId: string;
    schoolId?: string;
    ssoProvider: string;
  };

  @ApiProperty({
    description: "Access token expiration time",
    example: "2024-01-15T10:45:00.000Z",
  })
  expiresAt: string;
}
