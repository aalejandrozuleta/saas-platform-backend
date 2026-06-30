import React from 'react';

import { Base } from '../components/Base';

const e = React.createElement;

const s = {
  badge: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '20px', fontSize: '12px', color: '#6b7af7', fontWeight: '500', marginBottom: '20px' },
  h1: { fontSize: '22px', fontWeight: '600', color: '#ffffff', margin: '16px 0 12px', letterSpacing: '-0.3px' },
  body: { fontSize: '15px', lineHeight: '1.7', color: '#9a9a9a', marginBottom: '16px' },
  divider: { border: 'none', borderTop: '1px solid #1e1e1e', margin: '28px 0' },
  meta: { fontSize: '13px', color: '#555555', lineHeight: '1.6' },
  label: { color: '#777777' },
} as const;

export function MaintenanceEmail(message: string, scheduledAt: string, duration: string): React.ReactElement {
  return Base(
    'Aviso de mantenimiento — Arlok Platform',
    e(
      React.Fragment,
      null,
      e('span', { style: s.badge }, 'Aviso de plataforma'),
      e('h1', { style: s.h1 }, 'Mantenimiento programado'),
      e('p', { style: s.body }, message),
      e('hr', { style: s.divider }),
      e('p', { style: s.meta },
        e('strong', { style: s.label }, 'Fecha programada:'), ` ${scheduledAt}`, e('br'),
        e('strong', { style: s.label }, 'Duración estimada:'), ` ${duration}`,
      ),
    ),
  );
}
