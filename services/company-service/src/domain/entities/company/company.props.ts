import { type CompanyPlan } from '@domain/enums/company-plan.enum';

/**
 * Propiedades de la entidad Company (tenant).
 */
export interface CompanyProps {
  /** Identificador del tenant */
  readonly id: string;

  /** Razón social / nombre comercial de la empresa */
  readonly name: string;

  /** NIT / identificación tributaria (opcional hasta facturar) */
  readonly taxId?: string;

  /** Plan contratado del SaaS */
  readonly plan: CompanyPlan;

  /** Estado de la suscripción reportado por el proveedor de billing (Stripe) */
  readonly subscriptionStatus: string;

  /** Id del customer en Stripe (se crea al primer intento de pago) */
  readonly stripeCustomerId?: string;

  /** Id de la suscripción en Stripe */
  readonly stripeSubscriptionId?: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}
