import { Injectable, NotFoundException } from '@nestjs/common';
import { render } from '@react-email/render';

import { WelcomeEmail } from './emails/WelcomeEmail';
import { PasswordChangedEmail } from './emails/PasswordChangedEmail';
import { PasswordResetEmail } from './emails/PasswordResetEmail';
import { TwoFactorEnabledEmail } from './emails/TwoFactorEnabledEmail';
import { TwoFactorDisabledEmail } from './emails/TwoFactorDisabledEmail';
import { RecoveryCodesRegeneratedEmail } from './emails/RecoveryCodesRegeneratedEmail';
import { AccountLockedEmail } from './emails/AccountLockedEmail';
import { MaintenanceEmail } from './emails/MaintenanceEmail';
import { OtpCodeEmail } from './emails/OtpCodeEmail';
import { WorkerProvisionedEmail } from './emails/WorkerProvisionedEmail';

type Vars = Record<string, unknown>;

/**
 * Lee `key` de las variables del payload como string, o devuelve `fallback`
 * si no vino en el request. Evita que un template reciba `undefined` en
 * medio del HTML (se vería como "undefined" en el correo).
 *
 * @param v - Variables recibidas en el payload de la notificación.
 * @param key - Nombre de la variable a leer.
 * @param fallback - Valor a usar si `key` no está presente.
 * @returns El valor como string, o `fallback`.
 */
function s(v: Vars, key: string, fallback = '—'): string {
  return (v[key] as string | undefined) ?? fallback;
}

/**
 * Registro de templates disponibles: cada entrada mapea el nombre que llega
 * en `payload.template` a una factory que arma el `React.ReactElement` del
 * email a partir de las `variables` del payload. Agregar un template nuevo
 * es agregar una entrada acá (y su componente en `./emails`).
 */
const TEMPLATES: Record<string, (v: Vars) => React.ReactElement> = {
  welcome: (v) =>
    WelcomeEmail(
      s(v, 'email'),
      s(v, 'registeredAt'),
      s(v, 'ip'),
      s(v, 'country'),
      v['verificationUrl'] as string | undefined,
    ),

  'password-changed': (v) =>
    PasswordChangedEmail(s(v, 'email'), s(v, 'changedAt'), s(v, 'ip'), s(v, 'country')),

  'password-reset': (v) =>
    PasswordResetEmail(s(v, 'email'), s(v, 'requestedAt'), v['resetUrl'] as string | undefined),

  '2fa-enabled': (v) =>
    TwoFactorEnabledEmail(s(v, 'email'), s(v, 'enabledAt'), s(v, 'ip'), s(v, 'country')),

  '2fa-disabled': (v) =>
    TwoFactorDisabledEmail(s(v, 'email'), s(v, 'disabledAt'), s(v, 'ip'), s(v, 'country')),

  'recovery-codes-regenerated': (v) =>
    RecoveryCodesRegeneratedEmail(
      s(v, 'email'),
      s(v, 'regeneratedAt'),
      s(v, 'ip'),
      s(v, 'country'),
    ),

  'account-locked': (v) =>
    AccountLockedEmail(s(v, 'blockedUntil', 'Próximos 30 minutos'), s(v, 'ip'), s(v, 'country')),

  maintenance: (v) =>
    MaintenanceEmail(
      s(v, 'message', 'La plataforma Arlok tendrá un período de mantenimiento planificado.'),
      s(v, 'scheduledAt'),
      s(v, 'duration'),
    ),

  'otp-code': (v) => OtpCodeEmail(s(v, 'code', '------'), s(v, 'expiresIn', '10')),

  'worker-provisioned': (v) =>
    WorkerProvisionedEmail(
      s(v, 'firstName'),
      s(v, 'companyName'),
      s(v, 'loginEmail'),
      s(v, 'tempPassword'),
      v['appUrl'] as string | undefined,
    ),
};

/**
 * Motor de templates de email: resuelve un nombre de template a su
 * componente de React Email y lo renderiza a HTML.
 *
 * @remarks
 * Los templates son componentes de React (JSX vía `React.createElement`,
 * sin JSX transform) definidos en `./emails`, todos envueltos en el layout
 * común `Base` (`./components/Base.ts`). `@react-email/render` convierte
 * ese árbol de elementos a un string HTML apto para clientes de correo.
 * No hay compilación ni cache de templates: cada `render` reconstruye el
 * elemento desde cero con las variables del payload.
 */
@Injectable()
export class TemplateEngine {
  /**
   * Renderiza el template `template` a HTML usando `variables` del payload.
   *
   * @param template - Clave registrada en `TEMPLATES` (ver `payload.template`
   * en `EmailNotificationPayload`).
   * @param variables - Variables a inyectar; cada template solo usa las que
   * declara su función (ver `s()` para el manejo de faltantes).
   * @returns HTML final del email, listo para enviar vía `EmailChannel`.
   * @throws {NotFoundException} si `template` no existe en `TEMPLATES`. Esto
   * ocurre dentro del job de BullMQ (no se valida antes de encolar), así que
   * el error termina marcando el job como fallido.
   */
  async render(template: string, variables: Vars = {}): Promise<string> {
    const factory = TEMPLATES[template];
    if (!factory) throw new NotFoundException(`Template '${template}' no encontrado`);
    return render(factory(variables));
  }

  /** Lista los nombres de templates registrados (para debugging/validación). */
  list(): string[] {
    return Object.keys(TEMPLATES);
  }
}
