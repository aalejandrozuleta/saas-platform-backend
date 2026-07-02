import { NotFoundException } from '@nestjs/common';
import { type ReactElement } from 'react';

import { TemplateEngine } from './template.engine';

/**
 * @react-email/render usa `import()` dinámico internamente, lo que rompe bajo
 * el runtime CJS de Jest/SWC (falta --experimental-vm-modules). Para el unit
 * test de TemplateEngine no necesitamos el HTML final generado por React DOM,
 * solo verificar que cada template arma un árbol de React con el contenido
 * esperado, así que sustituimos `render` por un extractor de texto plano.
 */
jest.mock('@react-email/render', () => ({
  render: jest.fn(async (element: ReactElement) => extractText(element)),
}));

function extractText(node: unknown): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');

  const element = node as ReactElement<{ children?: unknown }>;
  if (element?.props?.children !== undefined) {
    return extractText(element.props.children);
  }

  return '';
}

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  describe('list', () => {
    it('debe listar todos los templates disponibles', () => {
      expect(engine.list()).toEqual([
        'welcome',
        'password-changed',
        '2fa-enabled',
        '2fa-disabled',
        'account-locked',
        'maintenance',
        'otp-code',
      ]);
    });
  });

  describe('render', () => {
    it('debe lanzar NotFoundException si el template no existe', async () => {
      await expect(engine.render('no-existe')).rejects.toThrow(NotFoundException);
    });

    it.each([
      ['welcome', { email: 'ana@example.com', registeredAt: 'hoy', ip: '1.1.1.1', country: 'CO' }],
      ['password-changed', { email: 'ana@example.com', changedAt: 'hoy', ip: '1.1.1.1', country: 'CO' }],
      ['2fa-enabled', { email: 'ana@example.com', enabledAt: 'hoy', ip: '1.1.1.1', country: 'CO' }],
      ['2fa-disabled', { email: 'ana@example.com', disabledAt: 'hoy', ip: '1.1.1.1', country: 'CO' }],
      ['account-locked', { blockedUntil: 'hoy', ip: '1.1.1.1', country: 'CO' }],
      ['maintenance', { message: 'msg', scheduledAt: 'hoy', duration: '1h' }],
      ['otp-code', { code: '123456', expiresIn: '10' }],
    ])('debe renderizar el template "%s" a un string HTML', async (template, variables) => {
      const html = await engine.render(template, variables);

      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    it('debe usar los valores por defecto cuando no se proveen variables', async () => {
      const html = await engine.render('welcome');

      expect(typeof html).toBe('string');
      expect(html).toContain('—');
    });

    it('debe incluir el link de verificación en welcome cuando se provee verificationUrl', async () => {
      const html = await engine.render('welcome', {
        email: 'ana@example.com',
        verificationUrl: 'https://arlok.dev/verify?token=abc',
      });

      expect(html).toContain('Activar mi cuenta');
      expect(html).toContain('expira en 24 horas');
    });
  });
});
