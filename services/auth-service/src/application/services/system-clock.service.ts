import { Injectable } from '@nestjs/common';
import { Clock } from '@application/ports/clock.port';

/**
 * Servicio responsable de proveer la hora actual del sistema.
 *
 * Permite desacoplar el dominio de implementaciones concretas
 * de tiempo, facilitando pruebas unitarias.
 */

@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
