/**
 * Estilos de texto compartidos por los templates de email en `../emails`
 * (título, párrafo, separador, bloque de metadata). Cada template define su
 * propio `badge` (color distinto según el tipo de notificación) y puede
 * agregar estilos adicionales, pero reutiliza estos en vez de redeclararlos.
 */
export const proseStyles = {
  h1: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '16px 0 12px',
    letterSpacing: '-0.3px',
  },
  body: { fontSize: '15px', lineHeight: '1.7', color: '#9a9a9a', marginBottom: '16px' },
  divider: { border: 'none', borderTop: '1px solid #1e1e1e', margin: '28px 0' },
  meta: { fontSize: '13px', color: '#555555', lineHeight: '1.6' },
  label: { color: '#777777' },
} as const;
