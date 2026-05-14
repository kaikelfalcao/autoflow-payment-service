import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ChargeOrmEntity } from './modules/billing/infrastructure/persistence/charge.typeorm.entity';
import { WebhookEventOrmEntity } from './modules/billing/infrastructure/persistence/webhook-event.typeorm.entity';
import { CreateChargesTable1 } from './modules/billing/infrastructure/persistence/migrations/1-CreateChargesTable';
import { CreateWebhookEventsTable2 } from './modules/billing/infrastructure/persistence/migrations/2-CreateWebhookEventsTable';
import { AddRefundedStatus3 } from './modules/billing/infrastructure/persistence/migrations/3-AddRefundedStatus';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'billing',
  password: process.env.DB_PASS ?? 'billing',
  database: process.env.DB_NAME ?? 'billing',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: [ChargeOrmEntity, WebhookEventOrmEntity],
  migrations: [CreateChargesTable1, CreateWebhookEventsTable2, AddRefundedStatus3],
});
