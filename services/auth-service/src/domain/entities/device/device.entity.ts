import { DeviceProps } from './device.props';

/**
 * Entidad de dominio Device
 *
 * Representa un dispositivo asociado a un usuario.
 */
export class Device {
  private constructor(
    private readonly props: DeviceProps,
  ) {}

  /**
   * Fábrica para creación de un nuevo dispositivo.
   */
  static create(props: DeviceProps): Device {
    if (!props.fingerprint) {
      throw new Error('DEVICE_FINGERPRINT_REQUIRED');
    }

    return new Device({
      ...props,
      isTrusted: props.isTrusted ?? false,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  /**
   * Reconstrucción desde persistencia.
   * NO aplica reglas de negocio.
   */
  static fromPersistence(props: DeviceProps): Device {
    return new Device(props);
  }

  // ======================
  // Getters
  // ======================

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get fingerprint(): string {
    return this.props.fingerprint;
  }

  get ipAddress(): string {
    return this.props.ipAddress;
  }

  get country(): string | undefined {
    return this.props.country;
  }

  get isTrusted(): boolean {
    return this.props.isTrusted;
  }

  get lastUsedAt(): Date | undefined {
    return this.props.lastUsedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // ======================
  // Reglas de dominio
  // ======================

  markAsTrusted(): Device {
    return new Device({
      ...this.props,
      isTrusted: true,
    });
  }

  updateLastUsed(): Device {
    return new Device({
      ...this.props,
      lastUsedAt: new Date(),
    });
  }
}
