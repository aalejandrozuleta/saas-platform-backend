import axios from 'axios';

import { NotificationHttpClient } from './notification.client';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NotificationHttpClient', () => {
  let post: jest.Mock;
  let envService: any;
  let client: NotificationHttpClient;

  const buildClient = () => {
    post = jest.fn();
    mockedAxios.create.mockReturnValue({ post } as never);

    envService = {
      get: jest.fn(
        (key: string) =>
          ({
            NOTIFICATION_SERVICE_URL: 'http://notification-service:3003',
            NOTIFICATION_SERVICE_TIMEOUT: 5000,
            INTERNAL_SERVICE_SECRET: 'secret',
          })[key],
      ),
    };

    return new NotificationHttpClient(envService);
  };

  beforeEach(() => {
    client = buildClient();
  });

  it('configura baseURL, timeout y el header interno', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://notification-service:3003',
      timeout: 5000,
      headers: { 'x-internal-api-key': 'secret' },
    });
  });

  it('envía el email al endpoint interno de notification-service', async () => {
    post.mockResolvedValue({ status: 202 });

    client.sendEmail({
      to: 'a@b.com',
      subject: 'Asunto',
      template: 'membership-invited',
      variables: { companyName: 'Acme' },
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(post).toHaveBeenCalledWith('/notifications/v1/notifications/email', {
      to: 'a@b.com',
      subject: 'Asunto',
      template: 'membership-invited',
      variables: { companyName: 'Acme' },
    });
  });

  it('nunca lanza si notification-service responde con error', async () => {
    post.mockRejectedValue(new Error('connection refused'));

    expect(() =>
      client.sendEmail({ to: 'a@b.com', subject: 'x', template: 'membership-invited' }),
    ).not.toThrow();

    await Promise.resolve();
    await Promise.resolve();
  });

  it('nunca lanza si notification-service responde con status >= 300', async () => {
    post.mockResolvedValue({ status: 500 });

    expect(() =>
      client.sendEmail({ to: 'a@b.com', subject: 'x', template: 'membership-invited' }),
    ).not.toThrow();

    await Promise.resolve();
    await Promise.resolve();
  });
});
