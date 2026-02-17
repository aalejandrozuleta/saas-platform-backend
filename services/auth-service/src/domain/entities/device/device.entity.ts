import { DeviceProps } from './device.props';

/**
 * Entidad Device
 */
export class Device {
  private constructor(private readonly props: DeviceProps) {}

  static create(props: DeviceProps): Device {
    if (!props.fingerprint) {
      throw new Error('DEVICE_FINGERPRINT_REQUIRED');
    }

    return new Device({
      ...props,
      isTrusted: props.isTrusted ?? false,
      createdAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get fingerprint(): string {
    return this.props.fingerprint;
  }

  get isTrusted(): boolean {
    return this.props.isTrusted;
  }

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
