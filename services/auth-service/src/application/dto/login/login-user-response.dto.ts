import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta al login de usuario
 */
export class LoginUserResponseDto {
  @ApiProperty({
    example: 'jwt-access-token',
    description: 'Access token JWT',
  })
  token!: string;

  @ApiProperty({
    example: 'refresh-token-uuid',
    description: 'Refresh token',
  })
  refreshToken!: string;
}