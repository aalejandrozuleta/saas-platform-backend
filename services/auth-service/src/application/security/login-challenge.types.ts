export enum LoginChallengeReason {
  NEW_DEVICE = 'NEW_DEVICE',
  UNTRUSTED_DEVICE = 'UNTRUSTED_DEVICE',
  UNTRUSTED_COUNTRY = 'UNTRUSTED_COUNTRY',
}

export enum LoginVerificationMethodType {
  EMAIL = 'EMAIL',
  TOTP = 'TOTP',
  SMS = 'SMS',
  RECOVERY_CODE = 'RECOVERY_CODE',
}

export interface LoginVerificationMethod {
  type: LoginVerificationMethodType;
  ready: boolean;
  isRecommended: boolean;
  destination?: string;
  metadata?: Record<string, unknown>;
}

export interface LoginSecurityChallengeMetadata {
  challengeType: 'LOGIN_VERIFICATION';
  reason: LoginChallengeReason;
  requiredAction: 'COMPLETE_ADDITIONAL_VERIFICATION';
  userId?: string;
  email?: string;
  deviceFingerprint?: string;
  country?: string;
  availableMethods: LoginVerificationMethod[];
}
