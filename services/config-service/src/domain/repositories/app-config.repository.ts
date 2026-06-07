import { AppConfig } from '@domain/entities/app-config/app-config.entity';
import { ConfigCategory } from '@domain/enums/config-category.enum';

export interface AppConfigRepository {
  findByKey(key: string): Promise<AppConfig | null>;
  findAll(category?: ConfigCategory): Promise<AppConfig[]>;
  save(config: AppConfig): Promise<AppConfig>;
  delete(key: string): Promise<void>;
}
