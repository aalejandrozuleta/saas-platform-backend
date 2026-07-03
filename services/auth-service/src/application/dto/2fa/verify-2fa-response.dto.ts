import { ApiProperty } from '@nestjs/swagger';

/**
 * Respuesta al confirmar la activación de 2FA: entrega los códigos
 * de recuperación de un solo uso para acceso de respaldo.
 */
export class Verify2faResponseDto {
  @ApiProperty({
    example: ['ABCD-EFGH', 'IJKL-MNOP'],
    description: 'Códigos de recuperación de un solo uso. Guárdalos en un lugar seguro.',
    type: [String],
  })
  recoveryCodes!: string[];
}
