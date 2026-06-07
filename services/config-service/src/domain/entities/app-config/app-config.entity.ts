import { ConfigCategory } from '@domain/enums/config-category.enum';

export interface AppConfigProps {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  category: ConfigCategory;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de configuración global de la aplicación.
 *
 * @remarks
 * Representa un par clave-valor de configuración con metadatos de auditoría.
 * Las claves bien conocidas (`maintenance.enabled`, `readonly.enabled`, etc.)
 * se consultan frecuentemente y se cachean en Redis.
 */
export class AppConfig {
  readonly id: string;
  readonly key: string;
  private _value: string;
  readonly description: string | null;
  readonly category: ConfigCategory;
  readonly updatedBy: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AppConfigProps) {
    this.id = props.id;
    this.key = props.key;
    this._value = props.value;
    this.description = props.description ?? null;
    this.category = props.category;
    this.updatedBy = props.updatedBy ?? null;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get value(): string {
    return this._value;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Devuelve `true` si el valor es la cadena `"true"` (insensible a mayúsculas). */
  isEnabled(): boolean {
    return this._value.toLowerCase() === 'true';
  }

  /** Actualiza el valor y marca la fecha de modificación. */
  setValue(value: string, updatedBy?: string): void {
    this._value = value;
    this._updatedAt = new Date();
  }

  toSnapshot(): AppConfigProps {
    return {
      id: this.id,
      key: this.key,
      value: this._value,
      description: this.description,
      category: this.category,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
