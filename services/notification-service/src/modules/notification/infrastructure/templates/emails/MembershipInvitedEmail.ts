import React from 'react';

import { Base } from '../components/Base';
import { proseStyles } from '../components/proseStyles';

const e = React.createElement;

/**
 * Solo permite http(s) en el href del botón. Mismo riesgo que en
 * `WelcomeEmail`/`WorkerProvisionedEmail`: el endpoint público de preview
 * pasa query params directo a las variables del template, así que sin esto
 * un valor como `javascript:...` ejecutaría código arbitrario al hacer click.
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
  ...proseStyles,
  highlight: { color: '#e8e8e8' },
  roleBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    backgroundColor: '#0d0d0d',
    border: '1px solid #1e1e1e',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#ffffff',
    fontFamily: 'Courier New,monospace',
  },
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
} as const;

/**
 * Email enviado cuando OWNER/MANAGER invita a un usuario ya registrado a
 * una empresa (template `membership-invited` en `TemplateEngine`,
 * disparado desde `InviteMemberUseCase` en company-service). A diferencia
 * de `WorkerProvisionedEmail`, aquí no hay credenciales nuevas: el
 * invitado ya tiene cuenta y solo necesita aceptar la invitación
 * (`POST /companies/:id/members/:membershipId/accept`) desde la app.
 *
 * @param companyName - Empresa que envía la invitación.
 * @param role - Rol con el que quedaría el invitado si acepta.
 * @param appUrl - URL de la plataforma para revisar/aceptar la invitación.
 */
export function MembershipInvitedEmail(
  companyName: string,
  role: string,
  appUrl?: string,
): React.ReactElement {
  const safeAppUrl = sanitizeHttpUrl(appUrl);

  return Base(
    'Te invitaron a una empresa',
    e(
      React.Fragment,
      null,
      e('span', { style: s.badge }, 'Nueva invitación'),
      e('h1', { style: s.h1 }, 'Te invitaron a unirte'),
      e(
        'p',
        { style: s.body },
        e('span', { style: s.highlight }, companyName),
        ' te invitó a unirte a su equipo en la plataforma Arlok con el rol ',
        e('span', { style: s.roleBadge }, role),
        '.',
      ),
      e(
        'p',
        { style: s.body },
        'Inicia sesión y revisa tus invitaciones pendientes para aceptarla o rechazarla.',
      ),
      safeAppUrl
        ? e(
            'div',
            { style: s.btnWrap },
            e('a', { href: safeAppUrl, style: s.btn }, 'Ver invitación'),
          )
        : null,
      e('hr', { style: s.divider }),
      e(
        'p',
        { style: s.meta },
        e('strong', { style: s.label }, 'Empresa:'),
        ` ${companyName}`,
        e('br'),
        e('strong', { style: s.label }, 'Rol:'),
        ` ${role}`,
      ),
    ),
  );
}
