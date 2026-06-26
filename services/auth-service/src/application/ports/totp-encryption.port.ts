export interface TotpEncryptionPort {
  encrypt(plaintext: string): string;
  decrypt(ciphertext: string): string;
}
