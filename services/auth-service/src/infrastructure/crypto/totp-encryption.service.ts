import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { EnvService } from '@config/env/env.service';
import { TotpEncryptionPort } from '@application/ports/totp-encryption.port';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

/**
 * Cifrado simétrico AES-256-GCM para TOTP secrets.
 *
 * Formato almacenado: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 *
 * La clave vive en TOTP_ENCRYPTION_KEY (env), nunca en la BD.
 * Un dump de la BD sin la clave es inútil para generar códigos TOTP.
 */
@Injectable()
export class TotpEncryptionService implements TotpEncryptionPort {

  private readonly key: Buffer;

  constructor(private readonly envService: EnvService) {
    this.key = Buffer.from(
      this.envService.get('TOTP_ENCRYPTION_KEY'),
      'hex',
    );
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid TOTP ciphertext format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    if (iv.length !== IV_BYTES || authTag.length !== AUTH_TAG_BYTES) {
      throw new Error('Invalid TOTP ciphertext lengths');
    }

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }
}
