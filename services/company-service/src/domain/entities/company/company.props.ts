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

  /** Email de contacto operativo de la empresa */
  readonly email: string;

  /** Teléfono de contacto operativo de la empresa */
  readonly phone: string;

  /** Dirección física de la empresa */
  readonly address: string;

  /** Ciudad donde opera la empresa */
  readonly city: string;

  /** País donde opera la empresa (código ISO de 2 letras, default `CO`) */
  readonly country: string;

  /** URL pública del logo, poblada solo vía el endpoint de upload */
  readonly logoUrl?: string;

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
