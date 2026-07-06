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

/**
 * Servicio de aplicación que construye el desafío de verificación adicional
 * ("step-up auth") que se exige antes de completar un login sospechoso.
 *
 * @remarks
 * Este servicio no decide *cuándo* se dispara el challenge (eso lo determina
 * {@link LoginPolicy} / el use case de login a partir de dispositivo no
 * confiable, país no confiable, etc.) — solo construye el *contenido* del
 * challenge una vez que ya se decidió exigirlo: qué métodos de verificación
 * están disponibles para ese usuario y con qué prioridad se le deben ofrecer
 * al cliente. El resultado se serializa como metadata de un error de dominio
 * (`SECURITY_CHALLENGE_REQUIRED`) que el cliente usa para renderizar el paso
 * de verificación adecuado, sin necesitar otra llamada al backend.
 */
@Injectable()
export class LoginSecurityChallengeService {
  /**
   * Crea el error de dominio `SECURITY_CHALLENGE_REQUIRED` con la metadata
   * necesaria para que el cliente resuelva el desafío de login.
   *
   * @param user - Usuario que intenta autenticarse.
   * @param profile - Perfil de seguridad del usuario (2FA, recovery codes), o `null` si no existe aún.
   * @param context - Contexto de red/dispositivo del intento de login.
   * @param reason - Motivo que disparó el challenge (dispositivo nuevo, no confiable, país no confiable, 2FA activo).
   * @param challengeToken - Token de corta duración (generado por el use case vía `TokenService`) que el cliente
   * reenvía a `POST /auth/login/verify-2fa` para resolver el challenge sin repetir la contraseña.
   * @returns Excepción de dominio lista para ser lanzada, con `availableMethods` ya resueltos.
   */
  createChallenge(
    user: User,
    profile: LoginSecurityProfile | null,
    context: LoginContext,
    reason: LoginChallengeReason,
    challengeToken: string,
  ) {
    const metadata: LoginSecurityChallengeMetadata = {
      challengeType: 'LOGIN_VERIFICATION',
      reason,
      requiredAction: 'COMPLETE_ADDITIONAL_VERIFICATION',
      userId: user.id,
      email: user.email.getValue(),
      deviceFingerprint: context.deviceFingerprint,
      country: context.country,
      availableMethods: this.resolveMethods(user, profile),
      challengeToken,
    };

    return DomainErrorFactory.securityChallengeRequired(
      metadata as unknown as Record<string, unknown>,
    );
  }

  /**
   * Determina qué métodos de verificación puede usar el usuario para superar
   * el challenge, en orden de aparición: EMAIL, TOTP, SMS y recovery codes.
   *
   * @remarks
   * Cada método se agrega solo si realmente está disponible para el usuario
   * (email verificado, 2FA configurado con ese método, recovery codes
   * generados). `isRecommended` prioriza 2FA (TOTP/SMS) por sobre EMAIL, y
   * nunca recomienda recovery codes: son un método de último recurso.
   */
  private resolveMethods(
    user: User,
    profile: LoginSecurityProfile | null,
  ): LoginVerificationMethod[] {
    const methods: LoginVerificationMethod[] = [];

    // Solo ofrecemos el método EMAIL si el correo está verificado.
    // Un email no verificado no puede recibir códigos de verificación.
    if (user.emailVerified) {
      methods.push({
        type: LoginVerificationMethodType.EMAIL,
        ready: true,
        isRecommended: !profile?.twoFactorEnabled,
        destination: this.maskEmail(user.email.getValue()),
        metadata: {
          emailVerified: true,
        },
      });
    }

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

  /**
   * Enmascara un email para mostrarlo en el challenge sin exponerlo completo
   * (ej. `jh******@gmail.com`), conservando solo los 2 primeros caracteres.
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');

    if (!localPart || !domain) {
      return email;
    }

    const visiblePrefix = localPart.slice(0, 2);
    return `${visiblePrefix}${'*'.repeat(Math.max(localPart.length - 2, 2))}@${domain}`;
  }
}
