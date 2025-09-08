import { ApiProperty } from "@nestjs/swagger";

export class LogoutResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Logout successful",
  })
  message: string;
}
