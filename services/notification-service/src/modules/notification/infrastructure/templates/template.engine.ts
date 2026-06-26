import { Injectable, NotFoundException } from '@nestjs/common';

/** Templates disponibles en la plataforma */
const TEMPLATES: Record<string, string> = {
  welcome: `
    <h1>Bienvenido, {{name}}!</h1>
    <p>Tu cuenta en la plataforma ha sido creada exitosamente.</p>
    <p>Puedes iniciar sesión en: <a href="{{loginUrl}}">{{loginUrl}}</a></p>
  `,
  maintenance: `
    <h1>Aviso de Mantenimiento</h1>
    <p>{{message}}</p>
    <p>Fecha programada: <strong>{{scheduledAt}}</strong></p>
    <p>Duración estimada: <strong>{{duration}}</strong></p>
  `,
  'password-changed': `
    <h1>Tu contraseña fue cambiada</h1>
    <p>Si no realizaste este cambio, contáctanos de inmediato.</p>
    <p>Fecha: {{changedAt}}</p>
    <p>IP: {{ip}}</p>
  `,
  'otp-code': `
    <h1>Código de verificación</h1>
    <p>Tu código es: <strong style="font-size:24px;letter-spacing:4px">{{code}}</strong></p>
    <p>Expira en {{expiresIn}} minutos.</p>
  `,
};

@Injectable()
export class TemplateEngine {
  render(template: string, variables: Record<string, unknown> = {}): string {
    const html = TEMPLATES[template];

    if (!html) {
      throw new NotFoundException(`Template '${template}' no encontrado`);
    }

    return html.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
      variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`,
    );
  }

  list(): string[] {
    return Object.keys(TEMPLATES);
  }
}
