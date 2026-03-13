import { DynamicModule, Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';
import { RedisModuleOptions } from './redis.types';

export interface RedisModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => RedisModuleOptions;
}

@Global()
@Module({})
export class RedisModule {

  static forRoot(options: RedisModuleOptions): DynamicModule {

    const provider = {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: options.host,
          port: options.port,
          password: options.password,
          lazyConnect: true,
          maxRetriesPerRequest: 3,
        });
      },
    };

    return {
      module: RedisModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {

    const provider = {
      provide: REDIS_CLIENT,
      inject: options.inject ?? [],
      useFactory: (...args: any[]) => {

        const config = options.useFactory(...args);

        return new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
          lazyConnect: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => Math.min(times * 50, 2000),
        });
      },
    };

    return {
      module: RedisModule,
      imports: options.imports ?? [],
      providers: [provider],
      exports: [provider],
    };
  }
}