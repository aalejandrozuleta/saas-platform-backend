import { type UserProfile } from '../entities/user-profile/user-profile.entity';

/**
 * Contrato de persistencia de UserProfile.
 */
export interface UserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  update(profile: UserProfile): Promise<void>;
}
