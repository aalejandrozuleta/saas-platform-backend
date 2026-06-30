import React from 'react';

import { Base } from '../components/Base';

const e = React.createElement;

const s = {
  badge: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '20px', fontSize: '12px', color: '#6b7af7', fontWeight: '500', marginBottom: '20px' },
  h1: { fontSize: '22px', fontWeight: '600', color: '#ffffff', margin: '16px 0 12px', letterSpacing: '-0.3px' },
  body: { fontSize: '15px', lineHeight: '1.7', color: '#9a9a9a', marginBottom: '16px' },
  highlight: { color: '#e8e8e8' },
  btnWrap: { textAlign: 'center' as const, margin: '28px 0' },
  btn: { display: 'inline-block', padding: '14px 32px', backgroundColor: '#6b7af7', color: '#ffffff', fontSize: '15px', fontWeight: '600', textDecoration: 'none', borderRadius: '8px', letterSpacing: '0.2px' },
  divider: { border: 'none', borderTop: '1px solid #1e1e1e', margin: '28px 0' },
  meta: { fontSize: '13px', color: '#555555', lineHeight: '1.6' },
  label: { color: '#777777' },
  hint: { fontSize: '12px', color: '#444444', textAlign: 'center' as const, marginTop: '12px' },
} as const;

export function WelcomeEmail(email: string, registeredAt: string, ip: string, country: string, verificationUrl?: string): React.ReactElement {
  return Base(
    'Activa tu cuenta Arlok — un clic y listo',
    e(
      React.Fragment,
      null,
      e('span', { style: s.badge }, 'Bienvenido a Arlok'),
      e('h1', { style: s.h1 }, 'Activa tu cuenta'),
      e('p', { style: s.body }, 'Hola ', e('span', { style: s.highlight }, email), ','),
      e('p', { style: s.body }, 'Gracias por registrarte. Para empezar a usar la plataforma Arlok, necesitas verificar tu dirección de correo electrónico.'),
      verificationUrl
        ? e('div', { style: s.btnWrap },
            e('a', { href: verificationUrl, style: s.btn }, 'Activar mi cuenta'),
          )
        : null,
      verificationUrl
        ? e('p', { style: s.hint }, 'El enlace expira en 24 horas.')
        : null,
      e('hr', { style: s.divider }),
      e('p', { style: s.meta },
        e('strong', { style: s.label }, 'Cuenta:'), ` ${email}`, e('br'),
        e('strong', { style: s.label }, 'Fecha de registro:'), ` ${registeredAt}`, e('br'),
        e('strong', { style: s.label }, 'IP de origen:'), ` ${ip}`, e('br'),
        e('strong', { style: s.label }, 'País:'), ` ${country}`,
      ),
    ),
  );
}
