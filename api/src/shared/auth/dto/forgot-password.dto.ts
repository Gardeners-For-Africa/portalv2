import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";
import { IsEqualTo } from "../../decorators/is-equal-to.decorator";

export class ForgotPasswordDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Password reset email sent successfully",
  })
  message: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: "Reset password token",
    example: "reset-token-123",
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: "New password",
    example: "NewPassword123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({
    description: "Confirm password",
    example: "NewPassword123!",
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsEqualTo("password", { message: "Password and confirm password must match" })
  confirmPassword: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Password reset successful",
  })
  message: string;
}
