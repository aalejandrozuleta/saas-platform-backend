export interface TotpSetup {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
}

export interface TotpService {
  generateSecret(accountName: string, issuer?: string): Promise<TotpSetup>;
  verifyToken(token: string, secret: string): boolean;
}
