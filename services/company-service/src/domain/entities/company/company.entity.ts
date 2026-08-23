import { CompanyPlan } from '@domain/enums/company-plan.enum';

import { type CompanyProps } from './company.props';

/**
 * Estado inicial de suscripción de una empresa recién creada.
 *
 * @remarks
 * El plan `STARTER` no pasa por Stripe todavía (no hay `stripeCustomerId`),
 * por lo que la empresa nace operativa. Cuando se integre Stripe Billing,
 * este valor pasará a reflejar los estados reales del proveedor
 * (`trialing`, `past_due`, `canceled`, ...) — por eso es `string` y no un
 * enum cerrado.
 */
export const DEFAULT_SUBSCRIPTION_STATUS = 'active';

/**
 * Entidad de dominio Company (tenant).
 *
 * Representa la empresa dueña de los datos operativos (productos, compras,
 * facturas). Todos los recursos del SaaS cuelgan de un `companyId`.
 */
export class Company {
  private constructor(private readonly props: CompanyProps) {}

  /**
   * Fábrica para la creación de una empresa nueva.
   *
   * Reglas: el nombre es obligatorio y no puede ser espacios en blanco.
   * Toda empresa nace en plan `STARTER` y suscripción activa.
   */
  static create(props: {
    id: string;
    name: string;
    taxId?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country?: string;
  }): Company {
    if (!props.name.trim()) {
      throw new Error('COMPANY_NAME_REQUIRED');
    }

    if (!props.email.trim()) {
      throw new Error('COMPANY_EMAIL_REQUIRED');
    }

    if (!props.phone.trim()) {
      throw new Error('COMPANY_PHONE_REQUIRED');
    }

    if (!props.address.trim()) {
      throw new Error('COMPANY_ADDRESS_REQUIRED');
    }

    if (!props.city.trim()) {
      throw new Error('COMPANY_CITY_REQUIRED');
    }

    const now = new Date();

    return new Company({
      id: props.id,
      name: props.name.trim(),
      taxId: props.taxId,
      email: props.email.trim(),
      phone: props.phone.trim(),
      address: props.address.trim(),
      city: props.city.trim(),
      country: props.country?.trim() ? props.country.trim() : 'CO',
      plan: CompanyPlan.STARTER,
      subscriptionStatus: DEFAULT_SUBSCRIPTION_STATUS,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstrucción desde persistencia.
   * NO aplica reglas de negocio.
   */
  static fromPersistence(props: CompanyProps): Company {
    return new Company(props);
  }

  // ======================
  // Getters
  // ======================

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get taxId(): string | undefined {
    return this.props.taxId;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }

  get address(): string {
    return this.props.address;
  }

  get city(): string {
    return this.props.city;
  }

  get country(): string {
    return this.props.country;
  }

  get logoUrl(): string | undefined {
    return this.props.logoUrl;
  }

  get plan(): CompanyPlan {
    return this.props.plan;
  }

  get subscriptionStatus(): string {
    return this.props.subscriptionStatus;
  }

  get stripeCustomerId(): string | undefined {
    return this.props.stripeCustomerId;
  }

  get stripeSubscriptionId(): string | undefined {
    return this.props.stripeSubscriptionId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ======================
  // Reglas de dominio
  // ======================

  /**
   * Renombra la empresa devolviendo una nueva instancia (entidad inmutable,
   * mismo patrón que `UserProfile` en auth-service).
   */
  rename(name: string): Company {
    if (!name.trim()) {
      throw new Error('COMPANY_NAME_REQUIRED');
    }

    return new Company({
      ...this.props,
      name: name.trim(),
      updatedAt: new Date(),
    });
  }

  /**
   * Actualiza la URL del logo devolviendo una nueva instancia (entidad
   * inmutable, mismo patrón que `rename()` / `UserProfile.updateAvatar()`
   * en auth-service).
   */
  updateLogo(logoUrl: string): Company {
    return new Company({
      ...this.props,
      logoUrl,
      updatedAt: new Date(),
    });
  }

  /**
   * Actualiza el perfil de la empresa (los mismos campos que se capturan en
   * `create()`, todos opcionales) devolviendo una nueva instancia. Los
   * campos requeridos (`name`, `email`, `phone`, `address`, `city`) no
   * pueden vaciarse si se envían: si el caller no quiere tocar un campo,
   * simplemente lo omite del patch en vez de mandarlo vacío.
   */
  updateProfile(patch: {
    name?: string;
    taxId?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }): Company {
    const next = {
      name: patch.name !== undefined ? patch.name.trim() : this.props.name,
      taxId: patch.taxId !== undefined ? patch.taxId : this.props.taxId,
      email: patch.email !== undefined ? patch.email.trim() : this.props.email,
      phone: patch.phone !== undefined ? patch.phone.trim() : this.props.phone,
      address: patch.address !== undefined ? patch.address.trim() : this.props.address,
      city: patch.city !== undefined ? patch.city.trim() : this.props.city,
      country: patch.country !== undefined ? patch.country.trim() : this.props.country,
    };

    if (!next.name) {
      throw new Error('COMPANY_NAME_REQUIRED');
    }

    if (!next.email) {
      throw new Error('COMPANY_EMAIL_REQUIRED');
    }

    if (!next.phone) {
      throw new Error('COMPANY_PHONE_REQUIRED');
    }

    if (!next.address) {
      throw new Error('COMPANY_ADDRESS_REQUIRED');
    }

    if (!next.city) {
      throw new Error('COMPANY_CITY_REQUIRED');
    }

    return new Company({
      ...this.props,
      ...next,
      updatedAt: new Date(),
    });
  }
}
