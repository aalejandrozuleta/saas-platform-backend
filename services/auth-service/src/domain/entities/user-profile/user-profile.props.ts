import { type DocumentType } from '@domain/enums/document-type.enum';

/**
 * Propiedades necesarias para crear un UserProfile
 */
export interface UserProfileProps {
  /** Id del User (auth) al que pertenece este perfil — misma PK, relación 1-a-1 */
  readonly userId: string;

  /** Nombre(s) */
  readonly firstName: string;

  /** Apellido(s) */
  readonly lastName: string;

  /** Teléfono de contacto (opcional, sin verificar, se completa progresivamente) */
  readonly phone?: string;

  /** Tipo de documento de identidad (opcional, se completa antes de pagar/facturar) */
  readonly documentType?: DocumentType;

  /** Número de documento */
  readonly documentNumber?: string;

  /** URL pública de la foto de perfil */
  readonly avatarUrl?: string;

  /** Momento en que aceptó el tratamiento de datos personales (Ley 1581 de 2012) */
  readonly dataProcessingAcceptedAt: Date;

  /** Momento en que aceptó los términos y condiciones */
  readonly termsAcceptedAt: Date;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}
