import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class RequestMagicLinkDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    description: "Redirect URL after login",
    example: "https://app.example.com/dashboard",
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectUrl?: string;
}

export class RequestMagicLinkResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Magic link sent to your email",
  })
  message: string;
}

export class VerifyMagicLinkDto {
  @ApiProperty({
    description: "Magic link token",
    example: "magic-token-123",
  })
  @IsString()
  token: string;
}

export class VerifyMagicLinkResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Magic link verified successfully",
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
  };

  @ApiProperty({
    description: "Access token expiration time",
    example: "2024-01-15T10:45:00.000Z",
  })
  expiresAt: string;
}
