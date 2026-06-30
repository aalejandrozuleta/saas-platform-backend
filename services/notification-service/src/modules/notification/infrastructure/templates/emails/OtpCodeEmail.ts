import React from 'react';

import { Base } from '../components/Base';

const e = React.createElement;

const s = {
  badge: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '20px', fontSize: '12px', color: '#6b7af7', fontWeight: '500', marginBottom: '20px' },
  h1: { fontSize: '22px', fontWeight: '600', color: '#ffffff', margin: '16px 0 12px', letterSpacing: '-0.3px' },
  body: { fontSize: '15px', lineHeight: '1.7', color: '#9a9a9a', marginBottom: '16px' },
  codeBlock: { backgroundColor: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '20px', textAlign: 'center' as const, margin: '20px 0' },
  code: { fontSize: '32px', fontWeight: '300', letterSpacing: '12px', color: '#ffffff', fontFamily: 'Courier New,monospace', margin: '0' },
  expiry: { fontSize: '13px', color: '#555555', textAlign: 'center' as const, margin: '0' },
} as const;

export function OtpCodeEmail(code: string, expiresIn: string): React.ReactElement {
  return Base(
    `Tu código Arlok: ${code}`,
    e(
      React.Fragment,
      null,
      e('span', { style: s.badge }, 'Verificación'),
      e('h1', { style: s.h1 }, 'Tu código de verificación'),
      e('p', { style: s.body }, 'Utiliza el siguiente código para completar tu acción. No lo compartas con nadie.'),
      e('div', { style: s.codeBlock }, e('p', { style: s.code }, code)),
      e('p', { style: s.expiry }, 'Expira en ', e('strong', null, `${expiresIn} minutos`)),
    ),
  );
}
