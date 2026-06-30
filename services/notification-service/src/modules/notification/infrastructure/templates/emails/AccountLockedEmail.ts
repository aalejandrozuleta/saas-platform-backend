import React from 'react';

import { Base } from '../components/Base';

const e = React.createElement;

const s = {
  badge: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#1e1010', border: '1px solid #3a1e1e', borderRadius: '20px', fontSize: '12px', color: '#e07070', fontWeight: '500', marginBottom: '20px' },
  h1: { fontSize: '22px', fontWeight: '600', color: '#ffffff', margin: '16px 0 12px', letterSpacing: '-0.3px' },
  body: { fontSize: '15px', lineHeight: '1.7', color: '#9a9a9a', marginBottom: '16px' },
  divider: { border: 'none', borderTop: '1px solid #1e1e1e', margin: '28px 0' },
  meta: { fontSize: '13px', color: '#555555', lineHeight: '1.6', marginBottom: '16px' },
  label: { color: '#777777' },
} as const;

export function AccountLockedEmail(blockedUntil: string, ip: string, country: string): React.ReactElement {
  return Base(
    'Tu cuenta Arlok fue bloqueada temporalmente por seguridad',
    e(
      React.Fragment,
      null,
      e('span', { style: s.badge }, 'Cuenta bloqueada'),
      e('h1', { style: s.h1 }, 'Tu cuenta ha sido bloqueada temporalmente'),
      e('p', { style: s.body }, 'Detectamos múltiples intentos de inicio de sesión fallidos en tu cuenta. Por tu seguridad, el acceso ha sido suspendido temporalmente.'),
      e('p', { style: s.meta },
        e('strong', { style: s.label }, 'Bloqueada hasta:'), ` ${blockedUntil}`, e('br'),
        e('strong', { style: s.label }, 'IP de los intentos:'), ` ${ip}`, e('br'),
        e('strong', { style: s.label }, 'País:'), ` ${country}`,
      ),
      e('hr', { style: s.divider }),
      e('p', { style: s.body }, 'Si eres tú quien intenta acceder, espera a que el bloqueo expire. Si no reconoces esta actividad, cambia tu contraseña inmediatamente.'),
    ),
  );
}
