import { Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user/user.entity';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { LoginSecurityProfile } from '@domain/repositories/security.repository';

import {
  LoginChallengeReason,
  LoginSecurityChallengeMetadata,
  LoginVerificationMethod,
  LoginVerificationMethodType,
} from './login-challenge.types';

@Injectable()
export class LoginSecurityChallengeService {
  createChallenge(
    user: User,
    profile: LoginSecurityProfile | null,
    context: LoginContext,
    reason: LoginChallengeReason,
  ) {
    const metadata: LoginSecurityChallengeMetadata = {
      challengeType: 'LOGIN_VERIFICATION',
      reason,
      requiredAction: 'COMPLETE_ADDITIONAL_VERIFICATION',
      deviceFingerprint: context.deviceFingerprint,
      country: context.country,
      availableMethods: this.resolveMethods(user, profile),
    };

    return DomainErrorFactory.securityChallengeRequired(
      metadata as unknown as Record<string, unknown>,
    );
  }

  private resolveMethods(
    user: User,
    profile: LoginSecurityProfile | null,
  ): LoginVerificationMethod[] {
    const methods: LoginVerificationMethod[] = [];

    methods.push({
      type: LoginVerificationMethodType.EMAIL,
      ready: true,
      isRecommended: !profile?.twoFactorEnabled,
      destination: this.maskEmail(user.email.getValue()),
      metadata: {
        emailVerified: user.emailVerified,
      },
    });

    if (profile?.twoFactorEnabled && profile.twoFactorMethod === 'TOTP') {
      methods.push({
        type: LoginVerificationMethodType.TOTP,
        ready: true,
        isRecommended: true,
      });
    }

    if (profile?.twoFactorEnabled && profile.twoFactorMethod === 'SMS') {
      methods.push({
        type: LoginVerificationMethodType.SMS,
        ready: true,
        isRecommended: true,
      });
    }

    if (profile?.hasRecoveryCodes) {
      methods.push({
        type: LoginVerificationMethodType.RECOVERY_CODE,
        ready: true,
        isRecommended: false,
      });
    }

    return methods;
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');

    if (!localPart || !domain) {
      return email;
    }

    const visiblePrefix = localPart.slice(0, 2);
    return `${visiblePrefix}${'*'.repeat(Math.max(localPart.length - 2, 2))}@${domain}`;
  }
}
