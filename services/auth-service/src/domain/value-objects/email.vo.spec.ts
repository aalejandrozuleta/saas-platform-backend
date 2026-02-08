import { EmailVO } from './email.vo';

describe('EmailVO', () => {
  it('debe crear un EmailVO válido y normalizado', () => {
    const email = EmailVO.create('  TEST@Example.COM  ');

    expect(email).toBeInstanceOf(EmailVO);
    expect(email.getValue()).toBe('test@example.com');
  });

  it('debe aceptar emails válidos', () => {
    const validEmails = [
      'user@example.com',
      'user.name@example.com',
      'user_name@example.co',
      'user-name@example.org',
      'u123@example.io',
    ];

    for (const value of validEmails) {
      expect(() => EmailVO.create(value)).not.toThrow();
    }
  });

  it('debe lanzar error si el email es inválido', () => {
    const invalidEmails = [
      '',
      '   ',
      'plainaddress',
      '@example.com',
      'user@',
      'user@com',
      'user@.com',
      'user@com.',
      'user@@example.com',
    ];

    for (const value of invalidEmails) {
      expect(() => EmailVO.create(value)).toThrow('INVALID_EMAIL');
    }
  });

  it('debe siempre devolver el valor normalizado', () => {
    const email = EmailVO.create('John.DOE@Example.COM');

    expect(email.getValue()).toBe('john.doe@example.com');
  });
});
