import { ApiProperty } from '@nestjs/swagger';

export class Enable2faResponseDto {
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP', description: 'Secreto TOTP en base32' })
  secret!: string;

  @ApiProperty({ example: 'otpauth://totp/...', description: 'URL otpauth para apps autenticadoras' })
  otpauthUrl!: string;

  @ApiProperty({ description: 'QR code en base64 para escanear con la app autenticadora' })
  qrCode!: string;
}
