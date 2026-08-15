import { generateWorkerLoginEmail } from './worker-login-email-generator';

describe('generateWorkerLoginEmail', () => {
  it('debe generar el email en el formato firstname.lastname@company-slug.trabajadores.local', async () => {
    const email = await generateWorkerLoginEmail('María', 'Pérez', 'Acme Corp', async () => true);

    expect(email).toBe('maria.perez@acme-corp.trabajadores.local');
  });

  it('debe normalizar nombres de empresa largos con puntuación', async () => {
    const email = await generateWorkerLoginEmail(
      'Juan',
      'Gómez',
      'Distribuidora El Sol S.A.S.',
      async () => true,
    );

    expect(email).toBe('juan.gomez@distribuidora-el-sol-s-a-s.trabajadores.local');
  });

  it('debe quitar acentos y diacríticos de nombre y apellido', async () => {
    const email = await generateWorkerLoginEmail('Andrés', 'Muñoz', 'Café Ñato', async () => true);

    expect(email).toBe('andres.munoz@cafe-nato.trabajadores.local');
  });

  it('debe reintentar con sufijo numérico en colisión', async () => {
    const taken = new Set([
      'juan.perez@acme.trabajadores.local',
      'juan.perez.2@acme.trabajadores.local',
    ]);

    const isAvailable = jest.fn(async (candidate: string) => !taken.has(candidate));

    const email = await generateWorkerLoginEmail('Juan', 'Perez', 'Acme', isAvailable);

    expect(email).toBe('juan.perez.3@acme.trabajadores.local');
    expect(isAvailable).toHaveBeenCalledTimes(3);
  });

  it('debe lanzar error si se agotan los intentos de colisión', async () => {
    await expect(
      generateWorkerLoginEmail('Juan', 'Perez', 'Acme', async () => false),
    ).rejects.toThrow('WORKER_LOGIN_EMAIL_GENERATION_EXHAUSTED');
  });
});
