import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CHARGE_REPOSITORY } from './domain/charge.repository';
import { MERCADO_PAGO_PORT } from './domain/ports/mercado-pago.port';
import { EVENT_PUBLISHER_PORT } from './domain/ports/event-publisher.port';

import { CreateChargeUseCase } from './application/use-cases/create-charge/create-charge.use-case';
import {
  ProcessWebhookUseCase,
  WEBHOOK_EVENT_REPOSITORY,
} from './application/use-cases/process-webhook/process-webhook.use-case';
import { GetChargeUseCase } from './application/use-cases/get-charge/get-charge.use-case';

import { ChargeOrmEntity } from './infrastructure/persistence/charge.typeorm.entity';
import { ChargeTypeOrmRepository } from './infrastructure/persistence/charge.typeorm.repository';
import { WebhookEventOrmEntity } from './infrastructure/persistence/webhook-event.typeorm.entity';
import { WebhookEventTypeOrmRepository } from './infrastructure/persistence/webhook-event.typeorm.repository';
import { MercadoPagoAdapter } from './infrastructure/mercado-pago/mercado-pago.adapter';
import { BillingEventPublisher } from './infrastructure/messaging/billing-event-publisher';
import { PaymentRequestedConsumer } from './infrastructure/messaging/payment-requested-consumer';

import { WebhookController } from './presentation/http/webhook.controller';
import { ChargeController } from './presentation/http/charge.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChargeOrmEntity, WebhookEventOrmEntity]),
  ],
  controllers: [WebhookController, ChargeController],
  providers: [
    { provide: CHARGE_REPOSITORY, useClass: ChargeTypeOrmRepository },
    { provide: MERCADO_PAGO_PORT, useClass: MercadoPagoAdapter },
    { provide: EVENT_PUBLISHER_PORT, useClass: BillingEventPublisher },
    { provide: WEBHOOK_EVENT_REPOSITORY, useClass: WebhookEventTypeOrmRepository },
    CreateChargeUseCase,
    ProcessWebhookUseCase,
    GetChargeUseCase,
    PaymentRequestedConsumer,
  ],
})
export class BillingModule {}
