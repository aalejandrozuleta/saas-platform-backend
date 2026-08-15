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
  static create(props: { id: string; name: string; taxId?: string }): Company {
    if (!props.name.trim()) {
      throw new Error('COMPANY_NAME_REQUIRED');
    }

    const now = new Date();

    return new Company({
      id: props.id,
      name: props.name.trim(),
      taxId: props.taxId,
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
}
