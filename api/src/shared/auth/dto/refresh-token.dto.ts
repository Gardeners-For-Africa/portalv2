import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token",
    example: "refresh-token-123",
  })
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Success message",
    example: "Token refreshed successfully",
  })
  message: string;

  @ApiProperty({
    description: "New access token expiration time",
    example: "2024-01-15T10:45:00.000Z",
  })
  expiresAt: string;
}
