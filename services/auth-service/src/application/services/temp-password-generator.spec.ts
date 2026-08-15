import { PasswordVO } from '@domain/value-objects/password.vo';

import { generateTempPassword } from './temp-password-generator';

describe('generateTempPassword', () => {
  it('debe generar una contraseña que cumple los requisitos de PasswordVO', () => {
    for (let i = 0; i < 50; i++) {
      const password = generateTempPassword();
      expect(() => PasswordVO.create(password)).not.toThrow();
    }
  });

  it('debe generar contraseñas de al menos 12 caracteres', () => {
    const password = generateTempPassword();
    expect(password.length).toBeGreaterThanOrEqual(12);
  });

  it('debe generar valores distintos en llamadas sucesivas', () => {
    const passwords = new Set(Array.from({ length: 20 }, () => generateTempPassword()));
    expect(passwords.size).toBe(20);
  });

  it('debe incluir al menos una minúscula, una mayúscula, un dígito y un carácter especial', () => {
    const password = generateTempPassword();

    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/\d/);
    expect(password).toMatch(/[\W_]/);
  });
});
