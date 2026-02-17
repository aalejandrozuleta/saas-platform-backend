/**
 * Propiedades necesarias para crear un Device
 */
export interface DeviceProps {
  /** Identificador único del dispositivo */
  readonly id: string;

  /** Usuario propietario del dispositivo */
  readonly userId: string;

  /** Huella única del dispositivo */
  readonly fingerprint: string;

  /** Nombre del dispositivo (opcional) */
  readonly deviceName?: string;

  /** Sistema operativo detectado */
  readonly os?: string;

  /** Navegador detectado */
  readonly browser?: string;

  /** País desde el que se registró */
  readonly country?: string;

  /** IP del dispositivo */
  readonly ipAddress: string;

  /** Indica si el dispositivo es confiable */
  readonly isTrusted: boolean;

  /** Último uso registrado */
  readonly lastUsedAt?: Date;

  /** Fecha de creación */
  readonly createdAt: Date;
}
