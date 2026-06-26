export interface RecoveryCodeRepository {
  createMany(userId: string, codeHashes: string[]): Promise<void>;
  deleteAllByUser(userId: string): Promise<void>;
}
