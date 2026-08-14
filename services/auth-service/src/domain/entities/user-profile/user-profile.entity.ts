import { type DocumentType } from '@domain/enums/document-type.enum';

import type { UserProfileProps } from './user-profile.props';

/**
 * Entidad de dominio UserProfile
 *
 * Datos de exhibición/contacto del usuario (nombre, teléfono, documento,
 * avatar) — deliberadamente separada de `User` (credenciales/seguridad,
 * ver `domain/entities/user`). Vive en auth-service porque es información
 * de identidad general, no específica de ningún rol (Persona/Trabajador).
 */
export class UserProfile {
  private constructor(private readonly props: UserProfileProps) {}

  /**
   * Fábrica para creación de un nuevo perfil ("paso 2" del registro,
   * posterior a crear el User con solo email/password).
   *
   * @remarks
   * `dataProcessingAcceptedAt`/`termsAcceptedAt` son obligatorios: no se
   * puede crear un perfil sin haber aceptado el tratamiento de datos
   * personales (Ley 1581 de 2012) ni los términos y condiciones.
   */
  static create(props: Omit<UserProfileProps, 'createdAt' | 'updatedAt'>): UserProfile {
    if (!props.firstName.trim()) {
      throw new Error('USER_PROFILE_FIRST_NAME_REQUIRED');
    }

    if (!props.lastName.trim()) {
      throw new Error('USER_PROFILE_LAST_NAME_REQUIRED');
    }

    if (!props.dataProcessingAcceptedAt) {
      throw new Error('USER_PROFILE_DATA_PROCESSING_CONSENT_REQUIRED');
    }

    if (!props.termsAcceptedAt) {
      throw new Error('USER_PROFILE_TERMS_CONSENT_REQUIRED');
    }

    const now = new Date();

    return new UserProfile({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstrucción desde persistencia.
   * NO aplica reglas de negocio.
   */
  static fromPersistence(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  // ======================
  // Getters
  // ======================

  get userId(): string {
    return this.props.userId;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get documentType(): DocumentType | undefined {
    return this.props.documentType;
  }

  get documentNumber(): string | undefined {
    return this.props.documentNumber;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get dataProcessingAcceptedAt(): Date {
    return this.props.dataProcessingAcceptedAt;
  }

  get termsAcceptedAt(): Date {
    return this.props.termsAcceptedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * El perfil está "completo" cuando además del mínimo (nombre/apellido)
   * tiene teléfono y documento — requisito antes de pagar, facturar o
   * registrar una empresa.
   */
  isCompleteForTransactions(): boolean {
    return Boolean(this.props.phone && this.props.documentType && this.props.documentNumber);
  }

  // ======================
  // Reglas de dominio
  // ======================

  /**
   * Actualiza los datos de contacto/identidad. Solo reemplaza los campos
   * provistos; el resto se mantiene igual (edición parcial).
   */
  updateContactInfo(changes: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    documentType?: DocumentType;
    documentNumber?: string;
  }): UserProfile {
    if (changes.firstName !== undefined && !changes.firstName.trim()) {
      throw new Error('USER_PROFILE_FIRST_NAME_REQUIRED');
    }

    if (changes.lastName !== undefined && !changes.lastName.trim()) {
      throw new Error('USER_PROFILE_LAST_NAME_REQUIRED');
    }

    return new UserProfile({
      ...this.props,
      ...changes,
      updatedAt: new Date(),
    });
  }

  /**
   * Reemplaza la foto de perfil por la nueva URL ya subida al storage.
   */
  updateAvatar(avatarUrl: string): UserProfile {
    return new UserProfile({
      ...this.props,
      avatarUrl,
      updatedAt: new Date(),
    });
  }
}
