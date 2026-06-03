import { BaseException, ErrorCode } from '@saas/shared';
/**
 * Error cuando el Auth Service no está disponible.
 */
export class AuthServiceUnavailableException extends BaseException {
  constructor(metadata?: Record<string, unknown>) {
    super(
      'common.auth_service_unavailable',
      ErrorCode.SERVICE_UNAVAILABLE,
      503,
      metadata
    );
  }
}
