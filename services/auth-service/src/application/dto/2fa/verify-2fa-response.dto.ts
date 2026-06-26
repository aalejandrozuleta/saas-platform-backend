import { ApiProperty } from '@nestjs/swagger';

export class Verify2faResponseDto {
  @ApiProperty({
    example: ['ABCD-EFGH', 'IJKL-MNOP'],
    description: 'Códigos de recuperación de un solo uso. Guárdalos en un lugar seguro.',
    type: [String],
  })
  recoveryCodes!: string[];
}
