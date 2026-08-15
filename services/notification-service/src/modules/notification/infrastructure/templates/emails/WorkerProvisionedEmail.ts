import React from 'react';

import { Base } from '../components/Base';
import { proseStyles } from '../components/proseStyles';

const e = React.createElement;

/**
 * Solo permite http(s) en el href del botón de acceso. Mismo riesgo que en
 * `WelcomeEmail`/`PasswordResetEmail`: el endpoint público de preview pasa
 * query params directo a las variables del template, así que sin esto un
 * valor como `javascript:...` ejecutaría código arbitrario al hacer click.
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
  credsBlock: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1e1e1e',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  },
  credsRow: { fontSize: '14px', lineHeight: '1.8', color: '#9a9a9a', margin: '0' },
  credsValue: {
    color: '#ffffff',
    fontFamily: 'Courier New,monospace',
    fontSize: '14px',
  },
  warning: { fontSize: '13px', color: '#e8b339', lineHeight: '1.6', marginBottom: '16px' },
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
 * Email enviado cuando una empresa registra directamente a un trabajador
 * (template `worker-provisioned` en `TemplateEngine`). Incluye las
 * credenciales generadas (login + contraseña temporal) para el primer
 * ingreso.
 *
 * @param firstName - Nombre del trabajador a saludar.
 * @param companyName - Empresa que creó la cuenta.
 * @param loginEmail - Correo/usuario generado para iniciar sesión.
 * @param tempPassword - Contraseña temporal generada.
 * @param appUrl - URL de la página de login de la plataforma.
 */
export function WorkerProvisionedEmail(
  firstName: string,
  companyName: string,
  loginEmail: string,
  tempPassword: string,
  appUrl?: string,
): React.ReactElement {
  const safeAppUrl = sanitizeHttpUrl(appUrl);

  return Base(
    'Tu cuenta Arlok está lista',
    e(
      React.Fragment,
      null,
      e('span', { style: s.badge }, 'Cuenta creada'),
      e('h1', { style: s.h1 }, 'Tu cuenta está lista'),
      e('p', { style: s.body }, 'Hola ', e('span', { style: s.highlight }, firstName), ','),
      e(
        'p',
        { style: s.body },
        e('span', { style: s.highlight }, companyName),
        ' creó una cuenta para ti en la plataforma Arlok. Usa las siguientes credenciales para iniciar sesión:',
      ),
      e(
        'div',
        { style: s.credsBlock },
        e(
          'p',
          { style: s.credsRow },
          e('strong', { style: s.label }, 'Usuario: '),
          e('span', { style: s.credsValue }, loginEmail),
        ),
        e(
          'p',
          { style: s.credsRow },
          e('strong', { style: s.label }, 'Contraseña temporal: '),
          e('span', { style: s.credsValue }, tempPassword),
        ),
      ),
      e(
        'p',
        { style: s.warning },
        'Por seguridad, deberás cambiar esta contraseña y aceptar los términos y condiciones en tu primer inicio de sesión.',
      ),
      safeAppUrl
        ? e(
            'div',
            { style: s.btnWrap },
            e('a', { href: safeAppUrl, style: s.btn }, 'Iniciar sesión'),
          )
        : null,
      e('hr', { style: s.divider }),
      e(
        'p',
        { style: s.meta },
        e('strong', { style: s.label }, 'Empresa:'),
        ` ${companyName}`,
        e('br'),
        e('strong', { style: s.label }, 'Usuario:'),
        ` ${loginEmail}`,
      ),
    ),
  );
}
