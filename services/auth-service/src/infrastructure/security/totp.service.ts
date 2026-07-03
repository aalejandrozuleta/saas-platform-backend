import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { TotpService, TotpSetup } from '@application/ports/totp.service.port';

/**
 * Implementación concreta de {@link TotpService} usando `otplib` (RFC 6238 / TOTP)
 * y `qrcode` para generar el código QR de aprovisionamiento.
 *
 * @remarks
 * Esta clase solo genera y verifica códigos TOTP en memoria: no persiste el
 * `secret` ni conoce el usuario al que pertenece. El cifrado en reposo del
 * `secret` es responsabilidad de {@link TotpEncryptionPort}, y la asociación
 * `secret` ↔ usuario vive en el repositorio correspondiente. Mantener esta
 * clase "tonta" respecto a persistencia facilita testearla y evita que un bug
 * de storage contamine la lógica criptográfica de TOTP.
 */
@Injectable()
export class TotpServiceImpl implements TotpService {
  /**
   * Genera un nuevo secreto TOTP y su URL `otpauth://` lista para ser
   * codificada como QR y escaneada por una app autenticadora (Google
   * Authenticator, Authy, etc.).
   *
   * @param accountName - Identificador legible del usuario (normalmente su email),
   * usado para etiquetar la entrada dentro de la app autenticadora.
   * @param issuer - Nombre del emisor mostrado en la app autenticadora.
   * @returns El `secret` en base32, la `otpauthUrl` y el `qrCode` (data URL) generado a partir de ella.
   */
  async generateSecret(accountName: string, issuer = 'SaaS Platform'): Promise<TotpSetup> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(accountName, issuer, secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl, { errorCorrectionLevel: 'M' });

    return { secret, otpauthUrl, qrCode };
  }

  /**
   * Verifica un código TOTP de 6 dígitos contra el `secret` del usuario.
   *
   * @remarks
   * `otplib` ya aplica internamente una ventana de tolerancia (drift) para
   * absorber pequeños desfases de reloj entre servidor y dispositivo. Cualquier
   * excepción (secret corrupto, formato inválido, etc.) se traduce a `false`
   * en lugar de propagarse, para que un error inesperado en la librería nunca
   * se confunda con una vulnerabilidad de "token siempre válido"; el llamador
   * solo necesita saber si el token es válido o no.
   *
   * @param token - Código de 6 dígitos ingresado por el usuario.
   * @param secret - Secreto TOTP en base32 asociado a ese usuario.
   * @returns `true` si el token es válido para el secret dado dentro de la ventana permitida.
   */
  verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch {
      return false;
    }
  }
}
