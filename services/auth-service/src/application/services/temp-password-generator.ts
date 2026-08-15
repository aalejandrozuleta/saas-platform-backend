import { randomBytes } from 'node:crypto';

/**
 * Conjuntos de caracteres usados para construir la contraseña temporal.
 * Se evitan caracteres ambiguos (0/O, 1/l/I) para reducir errores de
 * transcripción cuando el contacto de la empresa lee la contraseña desde
 * el email y la digita manualmente.
 */
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SPECIAL = '!@#$%^&*-_+=?';
const ALL = LOWERCASE + UPPERCASE + DIGITS + SPECIAL;

const PASSWORD_LENGTH = 16;

/**
 * Genera una contraseña temporal aleatoria criptográficamente segura
 * (`node:crypto.randomBytes`, no `Math.random`), garantizada a cumplir los
 * requisitos de {@link PasswordVO} (mínimo 12 caracteres, al menos una
 * minúscula, una mayúscula, un dígito y un carácter especial).
 *
 * @remarks
 * Usado por `ProvisionWorkerUseCase` para las credenciales iniciales de un
 * worker provisionado por su empresa. La contraseña nunca se persiste en
 * texto plano ni se retorna al llamador del use case — solo viaja en el
 * evento `WorkerProvisionedEvent` hacia el email del contacto.
 */
export function generateTempPassword(): string {
  // Un carácter garantizado de cada clase requerida, para no depender de
  // la probabilidad de que aparezcan en el resto aleatorio.
  const guaranteed = [
    pickRandom(LOWERCASE),
    pickRandom(UPPERCASE),
    pickRandom(DIGITS),
    pickRandom(SPECIAL),
  ];

  const rest = Array.from({ length: PASSWORD_LENGTH - guaranteed.length }, () => pickRandom(ALL));

  return shuffle([...guaranteed, ...rest]).join('');
}

function pickRandom(charset: string): string {
  const index = randomBytes(1)[0] % charset.length;
  return charset[index];
}

/**
 * Fisher-Yates shuffle usando bytes aleatorios criptográficos, para que la
 * posición de los caracteres "garantizados" no sea siempre la misma.
 */
function shuffle(chars: string[]): string[] {
  const result = [...chars];

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
