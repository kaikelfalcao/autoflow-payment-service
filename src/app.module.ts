import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envSchema } from './shared/infrastructure/config/env.schema';
import { HealthModule } from './shared/infrastructure/health/health.module';
import { LoggerModule } from './shared/logger/logger.module';
import { CorrelationIdMiddleware } from './shared/middlewares/correlation-id.middleware';
import { RabbitMqModule } from './infrastructure/messaging/rabbitmq.module';
import { BillingModule } from './modules/billing/billing.module';
import { ChargeOrmEntity } from './modules/billing/infrastructure/persistence/charge.typeorm.entity';
import { WebhookEventOrmEntity } from './modules/billing/infrastructure/persistence/webhook-event.typeorm.entity';
import { CreateChargesTable1700000010001 } from './modules/billing/infrastructure/persistence/migrations/1-CreateChargesTable';
import { CreateWebhookEventsTable1700000010002 } from './modules/billing/infrastructure/persistence/migrations/2-CreateWebhookEventsTable';
import { AddRefundedStatus1700000010003 } from './modules/billing/infrastructure/persistence/migrations/3-AddRefundedStatus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: envSchema,
      validationOptions: { abortEarly: false },
    }),

    LoggerModule,

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASS'),
        database: config.getOrThrow<string>('DB_NAME'),
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        entities: [ChargeOrmEntity, WebhookEventOrmEntity],
        migrations: [
          CreateChargesTable1700000010001,
          CreateWebhookEventsTable1700000010002,
          AddRefundedStatus1700000010003,
        ],
        migrationsRun: true,
        synchronize: false,
        logging: config.get('NODE_ENV') !== 'production',
      }),
    }),

    RabbitMqModule,
    HealthModule,
    BillingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
