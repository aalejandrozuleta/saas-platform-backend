import { type EnvService } from '@config/env/env.service';

import { type TemplateEngine } from '../templates/template.engine';
import { type EmailNotificationPayload } from '../../domain/events/email-notification.event';

import { EmailChannel } from './email.channel';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

describe('EmailChannel', () => {
  let channel: EmailChannel;
  let env: jest.Mocked<EnvService>;
  let templateEngine: jest.Mocked<TemplateEngine>;

  beforeEach(() => {
    sendMock.mockReset();

    env = {
      get: jest.fn((key: string) => {
        if (key === 'RESEND_API_KEY') return 'test-api-key';
        if (key === 'RESEND_FROM_EMAIL') return 'noreply@arlok.dev';
        return undefined;
      }),
    } as any;

    templateEngine = {
      render: jest.fn().mockResolvedValue('<html>hola</html>'),
    } as any;

    channel = new EmailChannel(env, templateEngine);
  });

  it('debe renderizar el template y enviar el email vía Resend', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    const payload: EmailNotificationPayload = {
      to: 'user@example.com',
      subject: 'Bienvenido',
      template: 'welcome',
      variables: { name: 'Juan' },
    };

    await channel.send(payload);

    expect(templateEngine.render).toHaveBeenCalledWith('welcome', { name: 'Juan' });
    expect(sendMock).toHaveBeenCalledWith({
      from: 'noreply@arlok.dev',
      to: ['user@example.com'],
      subject: 'Bienvenido',
      html: '<html>hola</html>',
    });
  });

  it('debe normalizar "to" como arreglo cuando ya es un arreglo', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email-2' }, error: null });

    await channel.send({
      to: ['a@example.com', 'b@example.com'],
      subject: 'Hola',
      template: 'welcome',
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: ['a@example.com', 'b@example.com'] }),
    );
  });

  it('debe usar un objeto vacío como variables por defecto', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email-3' }, error: null });

    await channel.send({
      to: 'user@example.com',
      subject: 'Hola',
      template: 'welcome',
    });

    expect(templateEngine.render).toHaveBeenCalledWith('welcome', {});
  });

  it('debe lanzar error y no completar el envío si Resend retorna un error', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'Dominio no verificado', name: 'validation_error' },
    });

    await expect(
      channel.send({
        to: 'user@example.com',
        subject: 'Hola',
        template: 'welcome',
      }),
    ).rejects.toThrow('Dominio no verificado');
  });
});
