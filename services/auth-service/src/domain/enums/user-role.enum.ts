/**
 * Roles de usuario en la plataforma.
 *
 * - SUPER_ADMIN:     Operador de la plataforma (equipo interno). Acceso total.
 * - BUSINESS_OWNER:  Dueño/administrador de un comercio. Gestión completa de su organización.
 * - ACCOUNTANT:      Contador del comercio. Lectura de finanzas y reportes, sin modificaciones.
 * - EMPLOYEE:        Trabajador del comercio. Crea y edita facturas/ventas, sin acceso financiero.
 * - CUSTOMER:        Persona natural externa. Recibe facturas y las paga desde la aplicación.
 */
export enum UserRole {
  SUPER_ADMIN    = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  ACCOUNTANT     = 'ACCOUNTANT',
  EMPLOYEE       = 'EMPLOYEE',
  CUSTOMER       = 'CUSTOMER',
}
