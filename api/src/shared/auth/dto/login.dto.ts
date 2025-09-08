import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    description: "User password",
    example: "password123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @ApiProperty({
    description: "Remember me option",
    example: false,
    required: false,
  })
  @IsOptional()
  rememberMe?: boolean;
}

export class LoginResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Login successful",
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
