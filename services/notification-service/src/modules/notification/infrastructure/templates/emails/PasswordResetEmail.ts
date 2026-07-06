import React from 'react';

import { Base } from '../components/Base';

const e = React.createElement;

/**
 * Solo permite http(s) en el href del botón de recuperación. Mismo
 * riesgo que en `WelcomeEmail`: el endpoint público de preview pasa query
 * params directo a las variables del template, así que sin esto un valor
 * como `javascript:...` ejecutaría código arbitrario al hacer click.
 */
function sanitizeHttpUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}

const s = {
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a4a',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#6b7af7',
    fontWeight: '500',
    marginBottom: '20px',
  },
  h1: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '16px 0 12px',
    letterSpacing: '-0.3px',
  },
  body: { fontSize: '15px', lineHeight: '1.7', color: '#9a9a9a', marginBottom: '16px' },
  highlight: { color: '#e8e8e8' },
  btnWrap: { textAlign: 'center' as const, margin: '28px 0' },
  btn: {
    display: 'inline-block',
    padding: '14px 32px',
    backgroundColor: '#6b7af7',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    borderRadius: '8px',
    letterSpacing: '0.2px',
  },
  divider: { border: 'none', borderTop: '1px solid #1e1e1e', margin: '28px 0' },
  meta: { fontSize: '13px', color: '#555555', lineHeight: '1.6' },
  label: { color: '#777777' },
  hint: { fontSize: '12px', color: '#444444', textAlign: 'center' as const, marginTop: '12px' },
} as const;

/**
 * Email enviado cuando un usuario solicita recuperar su contraseña
 * (template `password-reset` en `TemplateEngine`).
 *
 * @param email - Cuenta que solicitó la recuperación.
 * @param requestedAt - Fecha/hora de la solicitud (texto ya formateado).
 * @param resetUrl - Enlace con el token de recuperación (TTL corto).
 */
export function PasswordResetEmail(
  email: string,
  requestedAt: string,
  resetUrl?: string,
): React.ReactElement {
  const safeResetUrl = sanitizeHttpUrl(resetUrl);

  return Base(
    'Recupera tu contraseña Arlok',
    e(
      React.Fragment,
      null,
      e('span', { style: s.badge }, 'Recuperación de contraseña'),
      e('h1', { style: s.h1 }, 'Restablece tu contraseña'),
      e('p', { style: s.body }, 'Hola ', e('span', { style: s.highlight }, email), ','),
      e(
        'p',
        { style: s.body },
        'Recibimos una solicitud para restablecer la contraseña de tu cuenta Arlok. Haz clic en el siguiente botón para elegir una nueva.',
      ),
      safeResetUrl
        ? e(
            'div',
            { style: s.btnWrap },
            e('a', { href: safeResetUrl, style: s.btn }, 'Restablecer contraseña'),
          )
        : null,
      safeResetUrl ? e('p', { style: s.hint }, 'El enlace expira en 30 minutos.') : null,
      e(
        'p',
        { style: s.body },
        'Si no solicitaste este cambio, ignora este correo: tu contraseña actual seguirá funcionando.',
      ),
      e('hr', { style: s.divider }),
      e(
        'p',
        { style: s.meta },
        e('strong', { style: s.label }, 'Cuenta:'),
        ` ${email}`,
        e('br'),
        e('strong', { style: s.label }, 'Fecha de solicitud:'),
        ` ${requestedAt}`,
      ),
    ),
  );
}
