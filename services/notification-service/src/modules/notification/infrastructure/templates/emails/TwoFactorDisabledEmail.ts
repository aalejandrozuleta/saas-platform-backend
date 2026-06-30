import React from 'react';

import { Base } from '../components/Base';

const e = React.createElement;

const s = {
  badge: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#1e1010', border: '1px solid #3a1e1e', borderRadius: '20px', fontSize: '12px', color: '#e07070', fontWeight: '500', marginBottom: '20px' },
  h1: { fontSize: '22px', fontWeight: '600', color: '#ffffff', margin: '16px 0 12px', letterSpacing: '-0.3px' },
  body: { fontSize: '15px', lineHeight: '1.7', color: '#9a9a9a', marginBottom: '16px' },
  danger: { color: '#e07070' },
  divider: { border: 'none', borderTop: '1px solid #1e1e1e', margin: '28px 0' },
  meta: { fontSize: '13px', color: '#555555', lineHeight: '1.6' },
  label: { color: '#777777' },
} as const;

export function TwoFactorDisabledEmail(email: string, disabledAt: string, ip: string, country: string): React.ReactElement {
  return Base(
    'Alerta: 2FA desactivado en tu cuenta Arlok',
    e(
      React.Fragment,
      null,
      e('span', { style: s.badge }, 'Alerta de seguridad'),
      e('h1', { style: s.h1 }, 'Autenticación de dos factores desactivada'),
      e('p', { style: s.body }, 'La verificación en dos pasos ha sido ', e('strong', { style: s.danger }, 'deshabilitada'), ' en tu cuenta Arlok.'),
      e('p', { style: s.body }, 'Si no realizaste este cambio, tu cuenta puede estar comprometida. Contacta a soporte de inmediato.'),
      e('hr', { style: s.divider }),
      e('p', { style: s.meta },
        e('strong', { style: s.label }, 'Cuenta:'), ` ${email}`, e('br'),
        e('strong', { style: s.label }, 'Desactivado el:'), ` ${disabledAt}`, e('br'),
        e('strong', { style: s.label }, 'IP:'), ` ${ip}`, e('br'),
        e('strong', { style: s.label }, 'País:'), ` ${country}`,
      ),
    ),
  );
}
