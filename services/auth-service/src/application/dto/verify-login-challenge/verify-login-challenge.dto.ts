import { IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

/**
 * DTO para resolver el challenge de step-up auth emitido por `login`
 * (`SECURITY_CHALLENGE_REQUIRED`), usando TOTP o un recovery code.
 *
 * @remarks
 * Exactamente uno de `totpCode`/`recoveryCode` debe venir presente; esa
 * regla se valida en el use case (no aquí), ya que depende de cuál de
 * los dos el cliente decidió usar.
 */
export class VerifyLoginChallengeDto {
  @ApiProperty({
    description: 'Challenge token de corta duración recibido en la respuesta 403 del login',
  })
  @IsString()
  @IsNotEmpty()
  challengeToken!: string;

  @ApiPropertyOptional({
    example: '123456',
    description: 'Código TOTP de 6 dígitos generado por la app autenticadora',
  })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  totpCode?: string;

  @ApiPropertyOptional({
    example: 'A1B2C3D4-E5F6A7B8',
    description: 'Recovery code de un solo uso (formato XXXXXXXX-XXXXXXXX)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-F]{8}-[0-9A-F]{8}$/, {
    message: 'recoveryCode debe tener el formato XXXXXXXX-XXXXXXXX en mayúsculas',
  })
  recoveryCode?: string;
}
