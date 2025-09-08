import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { UserType } from "../../../database/entities/user.entity";

export class RegisterDto {
  @ApiProperty({
    description: "User first name",
    example: "John",
  })
  @IsString()
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  firstName: string;

  @ApiProperty({
    description: "User last name",
    example: "Doe",
  })
  @IsString()
  @MinLength(2, { message: "Last name must be at least 2 characters long" })
  lastName: string;

  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    description: "User password",
    example: "Password123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  })
  password: string;

  @ApiProperty({
    description: "User type",
    enum: UserType,
    example: UserType.STUDENT,
  })
  @IsEnum(UserType, { message: "Please provide a valid user type" })
  userType: UserType;

  @ApiProperty({
    description: "User phone number",
    example: "+1234567890",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: "School ID (if applicable)",
    example: "school-uuid",
    required: false,
  })
  @IsOptional()
  @IsString()
  schoolId?: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Registration successful. Please check your email to verify your account.",
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
    status: string;
  };
}
