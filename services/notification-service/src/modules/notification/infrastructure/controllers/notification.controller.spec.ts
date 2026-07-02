import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { type Response } from 'express';

import { EnqueueEmailUseCase } from '../../application/use-cases/enqueue-email.use-case';
import { EnqueueWsUseCase } from '../../application/use-cases/enqueue-ws.use-case';
import { TemplateEngine } from '../templates/template.engine';
import { type SendEmailDto } from '../../application/dtos/send-email.dto';
import { type SendWsDto } from '../../application/dtos/send-ws.dto';

import { NotificationController } from './notification.controller';

describe('NotificationController', () => {
  let controller: NotificationController;
  let enqueueEmail: jest.Mocked<EnqueueEmailUseCase>;
  let enqueueWs: jest.Mocked<EnqueueWsUseCase>;
  let templateEngine: jest.Mocked<TemplateEngine>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: EnqueueEmailUseCase, useValue: { execute: jest.fn() } },
        { provide: EnqueueWsUseCase, useValue: { execute: jest.fn() } },
        {
          provide: TemplateEngine,
          useValue: { list: jest.fn(), render: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(NotificationController);
    enqueueEmail = module.get(EnqueueEmailUseCase);
    enqueueWs = module.get(EnqueueWsUseCase);
    templateEngine = module.get(TemplateEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('debe encolar el email y responder queued: true', async () => {
      const dto: SendEmailDto = {
        to: 'user@example.com',
        subject: 'Bienvenido',
        template: 'welcome',
        variables: { name: 'Juan' },
      };

      const result = await controller.sendEmail(dto);

      expect(enqueueEmail.execute).toHaveBeenCalledWith({
        to: dto.to,
        subject: dto.subject,
        template: dto.template,
        variables: dto.variables,
      });
      expect(result).toEqual({ queued: true });
    });
  });

  describe('sendWs', () => {
    it('debe mapear target "broadcast" al literal broadcast', async () => {
      const dto: SendWsDto = {
        event: 'maintenance.scheduled',
        target: 'broadcast',
        data: { message: 'hola' },
      };

      const result = await controller.sendWs(dto);

      expect(enqueueWs.execute).toHaveBeenCalledWith({
        event: dto.event,
        target: 'broadcast',
        data: dto.data,
      });
      expect(result).toEqual({ queued: true });
    });

    it('debe mapear target "user" a un objeto con userId', async () => {
      const dto: SendWsDto = {
        event: 'security.alert',
        target: 'user',
        userId: 'user-1',
        data: { message: 'alerta' },
      };

      await controller.sendWs(dto);

      expect(enqueueWs.execute).toHaveBeenCalledWith({
        event: dto.event,
        target: { userId: 'user-1' },
        data: dto.data,
      });
    });
  });

  describe('listPreviews', () => {
    it('debe generar HTML con un link por cada template disponible', () => {
      templateEngine.list.mockReturnValue(['welcome', 'otp-code']);

      const html = controller.listPreviews();

      expect(html).toContain('welcome');
      expect(html).toContain('otp-code');
      expect(html).toContain('/notifications/v1/notifications/preview/welcome');
    });
  });

  describe('previewTemplate', () => {
    const makeRes = () =>
      ({
        setHeader: jest.fn(),
        send: jest.fn(),
      }) as unknown as jest.Mocked<Response>;

    it('debe renderizar el template combinando defaults con query params', async () => {
      templateEngine.list.mockReturnValue(['welcome']);
      templateEngine.render.mockResolvedValue('<html>preview</html>');
      const res = makeRes();

      await controller.previewTemplate('welcome', { email: 'custom@example.com' }, res);

      expect(templateEngine.render).toHaveBeenCalledWith(
        'welcome',
        expect.objectContaining({ email: 'custom@example.com' }),
      );
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(res.send).toHaveBeenCalledWith('<html>preview</html>');
    });

    it('debe lanzar NotFoundException si el template no existe', async () => {
      templateEngine.list.mockReturnValue(['welcome']);
      const res = makeRes();

      await expect(
        controller.previewTemplate('no-existe', {}, res),
      ).rejects.toThrow(NotFoundException);

      expect(templateEngine.render).not.toHaveBeenCalled();
    });

    it('debe usar un objeto vacío de defaults si el template no tiene valores predefinidos', async () => {
      templateEngine.list.mockReturnValue(['custom-template']);
      templateEngine.render.mockResolvedValue('<html>preview</html>');
      const res = makeRes();

      await controller.previewTemplate('custom-template', { foo: 'bar' }, res);

      expect(templateEngine.render).toHaveBeenCalledWith('custom-template', { foo: 'bar' });
    });
  });
});
