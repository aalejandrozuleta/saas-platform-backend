import { generateRecoveryCodes } from './recovery-code-generator';

describe('generateRecoveryCodes', () => {
  it('debe generar 8 códigos por defecto', () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(8);
  });

  it('debe generar la cantidad solicitada', () => {
    const codes = generateRecoveryCodes(3);
    expect(codes).toHaveLength(3);
  });

  it('debe generar códigos con formato XXXXXXXX-XXXXXXXX en mayúsculas', () => {
    const codes = generateRecoveryCodes(5);
    for (const code of codes) {
      expect(code).toMatch(/^[0-9A-F]{8}-[0-9A-F]{8}$/);
    }
  });

  it('debe generar códigos distintos entre sí', () => {
    const codes = generateRecoveryCodes(8);
    expect(new Set(codes).size).toBe(8);
  });
});
