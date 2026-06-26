import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { TotpService, TotpSetup } from '@application/ports/totp.service.port';

@Injectable()
export class TotpServiceImpl implements TotpService {
  async generateSecret(accountName: string, issuer = 'SaaS Platform'): Promise<TotpSetup> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(accountName, issuer, secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl, { errorCorrectionLevel: 'M' });

    return { secret, otpauthUrl, qrCode };
  }

  verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch {
      return false;
    }
  }
}
