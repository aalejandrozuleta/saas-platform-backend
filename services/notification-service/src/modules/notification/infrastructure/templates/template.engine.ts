import { Injectable, NotFoundException } from '@nestjs/common';
import { render } from '@react-email/render';

import { WelcomeEmail } from './emails/WelcomeEmail';
import { PasswordChangedEmail } from './emails/PasswordChangedEmail';
import { TwoFactorEnabledEmail } from './emails/TwoFactorEnabledEmail';
import { TwoFactorDisabledEmail } from './emails/TwoFactorDisabledEmail';
import { AccountLockedEmail } from './emails/AccountLockedEmail';
import { MaintenanceEmail } from './emails/MaintenanceEmail';
import { OtpCodeEmail } from './emails/OtpCodeEmail';

type Vars = Record<string, unknown>;

function s(v: Vars, key: string, fallback = '—'): string {
  return (v[key] as string | undefined) ?? fallback;
}

const TEMPLATES: Record<string, (v: Vars) => React.ReactElement> = {
  welcome: (v) => WelcomeEmail(s(v, 'email'), s(v, 'registeredAt'), s(v, 'ip'), s(v, 'country'), (v['verificationUrl'] as string | undefined)),

  'password-changed': (v) => PasswordChangedEmail(s(v, 'email'), s(v, 'changedAt'), s(v, 'ip'), s(v, 'country')),

  '2fa-enabled': (v) => TwoFactorEnabledEmail(s(v, 'email'), s(v, 'enabledAt'), s(v, 'ip'), s(v, 'country')),

  '2fa-disabled': (v) => TwoFactorDisabledEmail(s(v, 'email'), s(v, 'disabledAt'), s(v, 'ip'), s(v, 'country')),

  'account-locked': (v) => AccountLockedEmail(s(v, 'blockedUntil', 'Próximos 30 minutos'), s(v, 'ip'), s(v, 'country')),

  maintenance: (v) =>
    MaintenanceEmail(
      s(v, 'message', 'La plataforma Arlok tendrá un período de mantenimiento planificado.'),
      s(v, 'scheduledAt'),
      s(v, 'duration'),
    ),

  'otp-code': (v) => OtpCodeEmail(s(v, 'code', '------'), s(v, 'expiresIn', '10')),
};

@Injectable()
export class TemplateEngine {
  async render(template: string, variables: Vars = {}): Promise<string> {
    const factory = TEMPLATES[template];
    if (!factory) throw new NotFoundException(`Template '${template}' no encontrado`);
    return render(factory(variables));
  }

  list(): string[] {
    return Object.keys(TEMPLATES);
  }
}
