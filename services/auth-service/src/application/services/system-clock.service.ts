import { Injectable } from '@nestjs/common';
import { Clock } from '@application/ports/clock.port';

/**
 * Implementación real del reloj del sistema.
 */
@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
