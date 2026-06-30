import React from 'react';

const e = React.createElement;

const styles = {
  body: { backgroundColor: '#0a0a0a', fontFamily: 'Inter,-apple-system,BlinkMacSystemFont,sans-serif', margin: '0', padding: '0' },
  wrapper: { maxWidth: '600px', margin: '0 auto', padding: '40px 20px' },
  card: { backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' },
  header: { padding: '36px 40px 28px', borderBottom: '1px solid #1e1e1e' },
  logo: { fontSize: '22px', fontWeight: '600', letterSpacing: '-0.5px', color: '#ffffff', margin: '0' },
  logoAccent: { color: '#6b7af7' },
  content: { padding: '36px 40px' },
  footer: { padding: '0 40px 28px' },
  footerDivider: { border: 'none', borderTop: '1px solid #1e1e1e', margin: '0 0 20px' },
  footerText: { fontSize: '12px', color: '#444444', lineHeight: '1.7', textAlign: 'center' as const, margin: '0 0 8px' },
  footerLink: { color: '#555555', textDecoration: 'none' },
  footerCopy: { fontSize: '11px', color: '#333333', textAlign: 'center' as const, margin: '0' },
} as const;

export function Base(preview: string, children: React.ReactElement): React.ReactElement {
  const year = new Date().getFullYear();

  return e(
    'html',
    { lang: 'es' },
    e(
      'head',
      null,
      e('meta', { charSet: 'UTF-8' }),
      e('meta', { name: 'viewport', content: 'width=device-width,initial-scale=1.0' }),
      e('title', null, 'Arlok'),
    ),
    e(
      'body',
      { style: styles.body },
      e('div', { style: { display: 'none', maxHeight: '0', overflow: 'hidden' } }, preview),
      e(
        'div',
        { style: styles.wrapper },
        e(
          'div',
          { style: styles.card },
          e(
            'div',
            { style: styles.header },
            e('p', { style: styles.logo }, 'Arl', e('span', { style: styles.logoAccent }, 'ok')),
          ),
          e('div', { style: styles.content }, children),
          e(
            'div',
            { style: styles.footer },
            e('hr', { style: styles.footerDivider }),
            e(
              'p',
              { style: styles.footerText },
              'Este mensaje fue enviado automáticamente por Arlok Platform.',
              e('br'),
              'Si no reconoces esta actividad, ',
              e('a', { href: '#', style: styles.footerLink }, 'contacta a soporte'),
              ' de inmediato.',
            ),
            e('p', { style: styles.footerCopy }, `© ${year} Arlok · Todos los derechos reservados`),
          ),
        ),
      ),
    ),
  );
}
