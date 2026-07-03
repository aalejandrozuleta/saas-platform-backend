/**
 * Opciones de conexión para el cliente Redis compartido, usadas por
 * `RedisModule.forRoot` y como retorno de la factory en
 * `RedisModule.forRootAsync`.
 */
export interface RedisModuleOptions {
  host: string;
  port: number;
  password?: string;
}
