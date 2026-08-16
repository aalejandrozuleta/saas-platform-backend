const MAX_COLLISION_ATTEMPTS = 50;

/**
 * Genera el email de login "fake pero único" para un worker provisionado
 * directamente por su empresa, sin que el worker haya provisto un email
 * real. Formato: `{firstname}.{lastname}@{company-slug}.trabajadores.local`.
 *
 * @remarks
 * No es un email real — nunca se envía correo a esta dirección, solo se
 * usa como credencial de login. Las credenciales reales se comunican al
 * `contactEmail` de la empresa vía `WorkerProvisionedEvent`. En colisión
 * (`isAvailable` devuelve `false`) se agrega un sufijo numérico incremental
 * a la parte local (`.2`, `.3`, …), hasta {@link MAX_COLLISION_ATTEMPTS}
 * intentos.
 *
 * @throws Error `WORKER_LOGIN_EMAIL_GENERATION_EXHAUSTED` si se agotan los
 *   intentos de resolución de colisión.
 */
export async function generateWorkerLoginEmail(
  firstName: string,
  lastName: string,
  companyName: string,
  isAvailable: (email: string) => Promise<boolean>,
): Promise<string> {
  const firstSlug = slugifyNamePart(firstName);
  const lastSlug = slugifyNamePart(lastName);
  const companySlug = slugifyCompany(companyName);

  const localPartBase = `${firstSlug}.${lastSlug}`;
  const domain = `${companySlug}.trabajadores.local`;

  for (let attempt = 1; attempt <= MAX_COLLISION_ATTEMPTS; attempt++) {
    const localPart = attempt === 1 ? localPartBase : `${localPartBase}.${attempt}`;
    const candidate = `${localPart}@${domain}`;

    if (await isAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error('WORKER_LOGIN_EMAIL_GENERATION_EXHAUSTED');
}

/**
 * Normaliza una parte del nombre para uso en la parte local del email:
 * minúsculas, sin acentos/diacríticos, runs de caracteres no alfanuméricos
 * colapsados a un solo `-`.
 */
function slugifyNamePart(value: string): string {
  return slugify(value);
}

/**
 * Normaliza el nombre de la empresa para uso como subdominio.
 */
function slugifyCompany(value: string): string {
  return slugify(value);
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
