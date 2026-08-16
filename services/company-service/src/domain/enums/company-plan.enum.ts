/**
 * Plan de suscripción de la empresa (tier del SaaS).
 *
 * @remarks
 * Espejo del enum `CompanyPlan` de Prisma, declarado acá para que el
 * dominio no dependa del cliente generado por Prisma (infraestructura).
 */
export enum CompanyPlan {
  STARTER = 'STARTER',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
}
