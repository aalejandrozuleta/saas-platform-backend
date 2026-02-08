import { PasswordVO } from './password.vo';

describe('PasswordVO', () => {
  it('debe crear un PasswordVO válido cuando cumple todas las reglas', () => {
    const password = 'Str0ng-P@ssword';

    const vo = PasswordVO.create(password);

    expect(vo).toBeInstanceOf(PasswordVO);
    expect(vo.getValue()).toBe(password);
  });

  it('debe fallar si no tiene minúscula', () => {
    const password = 'STR0NG-P@SSWORD';

    expect(() => PasswordVO.create(password)).toThrow('INVALID_PASSWORD');
  });

  it('debe fallar si no tiene mayúscula', () => {
    const password = 'str0ng-p@ssword';

    expect(() => PasswordVO.create(password)).toThrow('INVALID_PASSWORD');
  });

  it('debe fallar si no tiene número', () => {
    const password = 'Strong-P@ssword';

    expect(() => PasswordVO.create(password)).toThrow('INVALID_PASSWORD');
  });

  it('debe fallar si no tiene carácter especial', () => {
    const password = 'Str0ngPassword';

    expect(() => PasswordVO.create(password)).toThrow('INVALID_PASSWORD');
  });

  it('debe fallar si tiene menos de 12 caracteres', () => {
    const password = 'Str0ng-P@s';

    expect(() => PasswordVO.create(password)).toThrow('INVALID_PASSWORD');
  });

  it('debe fallar con string vacío', () => {
    expect(() => PasswordVO.create('')).toThrow('INVALID_PASSWORD');
  });

  it('debe fallar con espacios únicamente', () => {
    expect(() => PasswordVO.create('            ')).toThrow(
      'INVALID_PASSWORD',
    );
  });

  it('debe aceptar contraseñas válidas diferentes', () => {
    const validPasswords = [
      'An0ther-G00d!',
      'Sup3r$ecurePwd',
      'Y3t-An0ther@Pwd',
    ];

    for (const pwd of validPasswords) {
      expect(() => PasswordVO.create(pwd)).not.toThrow();
    }
  });
});
