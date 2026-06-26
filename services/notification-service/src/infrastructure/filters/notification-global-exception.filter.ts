import { ArgumentsHost, Catch } from '@nestjs/common';
import { GlobalExceptionFilter } from '@saas/shared';

@Catch()
export class NotificationGlobalExceptionFilter extends GlobalExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    super.catch(exception, host);
  }
}
